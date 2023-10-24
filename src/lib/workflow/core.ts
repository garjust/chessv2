import { EMPTY, Observable, Subject, from, of, partition } from 'rxjs';
import {
  catchError,
  filter,
  first,
  map,
  mergeMap,
  pairwise,
  share,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';

/** Built-in "action" */
export enum Command {
  /** Instruct the workflow that it should complete all observables. */
  Done = 'command__DONE',
}

/**
 * Object returned by the core workflow initialization function. Includes a
 * function to emit actions to the workflow and observables output by the
 * workflow.
 */
export interface Workflow<S, A> {
  /**
   * Emit actions to the workflow.
   */
  emit: (action: A) => void;
  /**
   * Observable of states from the workflow. Subscribe to receive
   * the latest states.
   */
  states: Observable<S>;
  /**
   * Observable of actions that have been emitted to the workflow.
   * Includes before and after states with the action that caused the state change.
   */
  updates: Observable<[[S, S], A]>;
}

/**
 * Valid work that can be performed by the workflow.
 */
export type Work<A> =
  | Observable<A | Command | null | never>
  | Promise<A | Command | null | never>
  | A
  | Command;

export type LazyWork<A> = () => Work<A>;

/**
 * An update returned by an updater function. Actions emitted to the workflow
 * are handled by the updater returning a new state S and more work to perform.
 */
export type Update<S, A> = [S, LazyWork<A> | null];

/**
 * A workflow instance needs to define and provide a valid updater function.
 */
type Updater<S, A> = (state: Readonly<S>, action: Readonly<A>) => Update<S, A>;

type InternalAction<A> = A | Command | null;
type InternalUpdateAction<A> = Observable<InternalAction<A>>;
type InternalUpdate<S, A> = [S, InternalUpdateAction<A>];

const nonNullable = <T>(value: T): value is NonNullable<T> => value != null;

const isCommand = <A>(value: InternalAction<A>): value is Command =>
  value === Command.Done;

const isPromiseLike = (value: unknown): value is Promise<unknown> =>
  value instanceof Promise;

const normalizeWork = <A>(work: Work<A>): InternalUpdateAction<A> => {
  const observableAction = (() => {
    if (work instanceof Observable) {
      return work;
    } else if (isPromiseLike(work)) {
      return from(work);
    } else if (work !== null) {
      return of(work);
    } else {
      return EMPTY;
    }
  })();

  return observableAction.pipe(filter(nonNullable));
};

const update =
  <S, A>(updater: Updater<S, A>, seed: S) =>
  (source: Observable<A>) =>
    new Observable<Update<S, A>>((subscriber) => {
      let state: S = seed;
      const next = (action: A) => {
        try {
          const update = updater(state, action);
          state = update[0];
          subscriber.next(update);
        } catch (err) {
          subscriber.error(err);
        }
      };
      const error = (err: Error) => {
        subscriber.error(err);
      };
      const subscription = source.subscribe({ next, error });
      return () => subscription.unsubscribe();
    });

const core = <S, A>(updater: Updater<S, A>, seed: S): Workflow<S, A> => {
  // Public states subject. This will be exposed publically as a hot
  // observable for workflow state.
  const publicStates = new Subject<S>();
  // Public side-effect subject. This will be exposed publically as a hot
  // observable for workflow side-effects.
  const publicUpdates = new Subject<[[S, S], A]>();
  // Internal actions subject. This subject is the "root" observable of the
  // workflow.
  const internalActions = new Subject<InternalAction<A>>();

  // Handle Commands
  const [commands, actions] = partition(
    internalActions,
    (val: InternalAction<A>) => isCommand(val),
  ) as [Observable<Command>, Observable<A>];
  commands
    .pipe(
      first((command) => command === Command.Done),
      catchError(() => EMPTY),
    )
    .subscribe(() => publicStates.complete());

  // This observable receives actions and invokes the updater function
  const actionHandler: Observable<InternalUpdate<S, A>> = actions.pipe(
    update(updater, seed),
    map(
      ([state, lazyWork]): InternalUpdate<S, A> => [
        state,
        normalizeWork(lazyWork?.() ?? null),
      ],
    ),
    // We need this observable to be hot so that the update function does not
    // receive duplicate invocations for a particular action
    share(),
  );

  // This observable powers our public states observable
  const states: Observable<S> = actionHandler.pipe(
    map(([state, _]) => state),
    // immediately send the initial state into the observable
    // (aids with updates initial value)
    startWith(seed),
  );

  // This observable powers our public updates/side-effect observable
  const updates = states.pipe(
    // select previous and next state
    pairwise(),
    withLatestFrom(actions),
    map(([states, action]): [[S, S], A] => [states, action]),
    // swallow errors from upstream and end the observable gracefully
    // catchError(() => EMPTY),
  );

  // Subscribe to our internal observables to push values into our public
  // subjects
  updates.subscribe(publicUpdates);
  states.subscribe(publicStates);

  // This observable extracts any next actions from the result of calling the
  // updater function
  actionHandler
    .pipe(
      // swallow errors from upstream and end the observable gracefully;
      // do not continue with more actions
      catchError(() => EMPTY),
      // flat map the next actions observable upward for subscription
      mergeMap(([_, actions]) => actions),
    )
    .subscribe(internalActions);

  return {
    emit: (action: A | Command) => internalActions.next(action),
    states: publicStates.asObservable().pipe(share()),
    updates: publicUpdates.asObservable().pipe(share()),
  };
};

export default core;
