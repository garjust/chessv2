import { from } from 'rxjs';
import { Update } from '../core';

export enum Type {
  Exception = 'EXCEPTION',
  Increment = 'INCREMENT',
  AsyncIncrement = 'ASYNC_INCREMENT',
}

export type Action =
  | { readonly type: Type.Exception; async: boolean }
  | { readonly type: Type.Increment; value: number }
  | { readonly type: Type.AsyncIncrement; value: number };

export type State = Readonly<{
  count: number;
}>;

export type Context = Readonly<{
  multiplier: number;
}>;

export const update =
  (context: Context) =>
  (state: State, action: Action): Update<State, Action> => {
    switch (action.type) {
      case Type.Increment:
        return [
          { ...state, count: state.count + action.value * context.multiplier },
          null,
        ];
      case Type.AsyncIncrement:
        return [
          state,
          () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve({ type: Type.Increment, value: action.value });
              }, 50);
            }),
        ];
      case Type.Exception:
        if (action.async) {
          return [
            state,
            () => from(Promise.reject('promise rejection in update')),
          ];
        } else {
          throw Error('test error in update');
        }
    }
  };
