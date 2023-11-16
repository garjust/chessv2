import React, { useContext, useEffect, useState } from 'react';
import { Observable, distinctUntilChanged, map } from 'rxjs';
import { Workflow } from '..';
import { Command } from '../commands';
import isEqual from 'lodash.isequal';

// const wrappedDeepEqual = <T>(a: T, b: T): boolean => {
//   const now = performance.now();
//   const val = isEqual(a, b);
//   const timing = (performance.now() - now) * 1000;
//   if (timing > 200) {
//     console.debug('deep equal > 200μs', b);
//   }
//   return val;
// };

export const contextFactory = <S, A>(
  initialState: S,
  renderingEquals: (a: unknown, b: unknown) => boolean = isEqual,
): {
  WorkflowContext: React.Context<Workflow<S, A>>;
  useWorkflow: <R>(
    render: (state: S) => R,
    renderDistinctOnly?: boolean,
  ) => {
    rendering: R;
    emit: (action: A) => void;
  };
} => {
  const reactContext = React.createContext<Workflow<S, A>>({
    emit: (_: A | Command) => {
      /* do nothing, this is just an empty default */
    },
    states$: new Observable<S>(),
    updates$: new Observable<[[S, S], A]>(),
  });

  return {
    WorkflowContext: reactContext,
    useWorkflow: <R>(render: (state: S) => R, renderDistinctOnly = true) => {
      const [rendering, setRendering] = useState<R>(render(initialState));
      const { states$: states, emit } = useContext(reactContext);

      useEffect(() => {
        const subscription = states
          .pipe(
            map(render),
            distinctUntilChanged<R>(
              renderDistinctOnly ? renderingEquals : undefined,
            ),
          )
          .subscribe(setRendering);
        return function cleanup() {
          subscription.unsubscribe();
        };
      }, [states]);

      return { rendering, emit };
    },
  };
};
