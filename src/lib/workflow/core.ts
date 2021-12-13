import { Observable, Subject, empty, of, partition } from 'rxjs';
import {
  catchError,
  filter,
  first,
  flatMap,
  map,
  pairwise,
  share,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';

export enum Command {
  Done = 'SECRET_KEY__DO_NOT__USE__OR_WE_WILL_ADD_MORE_UNDERSCORES/DONE',
}

type NextActionObservable<A> = Observable<A | Command | null | never>;

export type NextAction<A> = NextActionObservable<A> | A | Command | null;

export type Update<S, A> = [S, NextAction<A>];

// FIXME(steckel): How do we have the type system enforce Readonly<T>?
export type Updater<S, A, C> = (
  state: Readonly<S>,
  action: Readonly<A>,
  context: Readonly<C>
) => Update<S, A>;

export type UpdateSubscriber<S, A, C> = (
  state: S,
  action: A,
  context: C
) => void;

type InternalAction<A> = A | Command;

type InternalUpdateAction<A> = Observable<InternalAction<A>>;

type InternalUpdate<S, A> = [S, InternalUpdateAction<A>];

export interface Workflow<S, A, C> {
  emit: (action: A) => void;
  states: Observable<S>;
  updates: Observable<[[S, S], A, C]>;
}

// TODO(steckel): Don't export.
export const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value != null;

const isCommand = <A>(value: InternalAction<A>): value is Command =>
  value === Command.Done;

// TODO(steckel): Maybe don't export.
export const normalizeUpdateAction = <A>(
  nextAction: NextAction<A>
): InternalUpdateAction<A> =>
  (nextAction instanceof Observable
    ? nextAction
    : nextAction !== null
    ? of(nextAction)
    : empty()
  ).pipe(filter(nonNullable));

// NOTE(steckel): I'd love to go to war with prettier over this formatting.
const normalizeUpdate = <S, A>([state, nextAction]: Update<
  S,
  A
>): InternalUpdate<S, A> => [state, normalizeUpdateAction(nextAction)];

const update =
  <S, A, C>(updater: Updater<S, A, C>, seed: S, context: C) =>
  (source: Observable<A>) =>
    new Observable<Update<S, A>>((subscriber) => {
      let state: S = seed;
      const next = (action: A) => {
        try {
          const update = updater(state, action, context);
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

const core = <S, A, C>(
  updater: Updater<S, A, C>,
  seed: S,
  context: C
): Workflow<S, A, C> => {
  // Public states subject. This will be exposed publically as a hot
  // observable for workflow state.
  const publicStates = new Subject<S>();
  // Public side-effect subject. This will be exposed publically as a hot
  // observable for workflow side-effects.
  const publicUpdates = new Subject<[[S, S], A, C]>();

  const internalActions = new Subject<InternalAction<A>>();

  const [commands, actions] = partition(
    internalActions,
    (val: InternalAction<A>) => isCommand(val)
  ) as [Observable<Command>, Observable<A>];

  // Handle Command.DONE
  commands
    .pipe(
      first((command) => command === Command.Done),
      catchError(() => empty())
    )
    .subscribe(() => publicStates.complete());

  // This observable receives actions and invokes the updater function
  const actionHandler: Observable<InternalUpdate<S, A>> = actions.pipe(
    update(updater, seed, context),
    map(normalizeUpdate),
    // We need this observable to be hot so that the update function does not
    // receive duplicate invocations for a particular action
    share()
  );

  // This observable powers our public states observable
  const states: Observable<S> = actionHandler.pipe(
    map(([state, _]) => state),
    // immediately send the initial state into the observable
    // (aids with updates initial value)
    startWith(seed)
  );

  // This observable powers our public updates/side-effect observable
  const updates = states.pipe(
    // select previous and next state
    pairwise(),
    withLatestFrom(actions),
    map(([states, action]): [[S, S], A, C] => [states, action, context]),
    // swallow errors from upstream and end the observable gracefully
    catchError(() => empty())
  );

  // Subscribe to our internal observables to push values into our public
  // subjects
  updates.subscribe({
    next: (value) => publicUpdates.next(value),
  });
  states.subscribe({
    next: (value) => publicStates.next(value),
    error: (err) => publicStates.error(err),
  });

  // This observable extracts any next actions from the result of calling the
  // updater function
  actionHandler
    .pipe(
      // swallow errors from upstream and end the observable gracefully;
      // do not continue with more actions
      catchError(() => empty()),
      // flat map the next actions observable upward for subscription
      flatMap(([_, actions]) => actions)
    )
    .subscribe({
      // forward actions to original actions subject for processing
      next: (action) => internalActions.next(action),
      // forward errors to original actions subject to publish error within
      // the public states observable
      error: (err) => internalActions.error(err),
    });

  // TODO(steckel): Consider transforming states with `.pipe(distinctUntilChanged)`
  return {
    emit: (action: A) => internalActions.next(action),
    states: publicStates.asObservable().pipe(share()),
    updates: publicUpdates.asObservable().pipe(share()),
  };
};

export default core;
