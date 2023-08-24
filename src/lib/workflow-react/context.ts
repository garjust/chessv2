import React, { useContext, useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { Workflow } from '../workflow';

export const contextFactory = <S, A>(
  initialState: S,
): {
  WorkflowContext: React.Context<Workflow<S, A>>;
  useWorkflow: <R>(render: (state: S) => R) => {
    rendering: R;
    emit: (action: A) => void;
  };
} => {
  const reactContext = React.createContext({
    states: new Observable<S>(),
    emit: (_: A) => {
      /* do nothing, this is just an empty default */
    },
    updates: new Observable<[[S, S], A]>(),
  });

  return {
    WorkflowContext: reactContext,
    useWorkflow: <R>(render: (state: S) => R) => {
      const [state, setState] = useState(initialState);
      const { states, emit } = useContext(reactContext);

      useEffect(() => {
        const subscription = states.subscribe((newState) => {
          setState(newState);
        });
        return function cleanup() {
          subscription.unsubscribe();
        };
      }, [states]);

      return { rendering: render(state), emit };
    },
  };
};
