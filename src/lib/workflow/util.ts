interface Emitable<A> {
  emit(action: A): void;
}

// Usage of this feels a bit yucky intuitively. Is a minimal setTimeout to
// emulate concurrency a hack?
//
// Ultimately I want the current thread of execution in the workflow to fully
// resolve before doing these further emits/side-effects so maybe this is
// the way.
export const delayEmit = <A>(
  workflow: Emitable<A>,
  ...actions: A[]
): Promise<null> =>
  new Promise((resolve) => {
    setTimeout(() => {
      for (const action of actions) {
        workflow.emit(action);
      }
      resolve(null);
    }, 0);
  });

export const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value != null;

export const isPromiseLike = (value: unknown): value is Promise<unknown> =>
  value instanceof Promise;
