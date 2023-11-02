import React, { useContext, useEffect, useState } from 'react';
import { Observable, distinctUntilChanged, map } from 'rxjs';
import { Workflow } from '../workflow';
import { Command } from '../workflow/commands';

export const contextFactory = <S, A>(
  initialState: S,
): {
  WorkflowContext: React.Context<Workflow<S, A>>;
  useWorkflow: <R>(render: (state: S) => R) => {
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
    useWorkflow: <R>(render: (state: S) => R) => {
      const [rendering, setRendering] = useState<R>(render(initialState));
      const { states$: states, emit } = useContext(reactContext);

      useEffect(() => {
        const subscription = states
          .pipe(map(render), distinctUntilChanged())
          .subscribe(setRendering);
        return function cleanup() {
          subscription.unsubscribe();
        };
      }, [states]);

      return { rendering, emit };
    },
  };
};
