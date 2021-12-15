import React, { useContext, useEffect, useState } from 'react';
import { Observable, Subscription } from 'rxjs';
import { Workflow } from '../workflow';

export const contextFactory = <S, A, C>(
  initialState: S
): {
  WorkflowContext: React.Context<Workflow<S, A, C>>;
  useWorkflow: (debug?: boolean) => { state: S; emit: (action: A) => void };
} => {
  const reactContext = React.createContext({
    states: new Observable<S>(),
    emit: (_: A) => {
      /* do nothing, this is just an empty default */
    },
    updates: new Observable<[[S, S], A, C]>(),
  });

  return {
    WorkflowContext: reactContext,
    useWorkflow: (debug = false) => {
      const [state, setState] = useState(initialState);
      const { states, emit } = useContext(reactContext);
      useEffect(() => {
        const subscription = states.subscribe((newState) => {
          // console.log('set', (newState as any).debugN);
          setState(newState);
        });
        return function cleanup() {
          subscription.unsubscribe();
        };
      }, [states]);

      return { state, emit };
    },
  };
};
