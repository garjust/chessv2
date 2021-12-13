import React, { useContext, useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { Action, Context, createState, State } from '../workflow';

const WorkflowContext = React.createContext({
  states: new Observable<State>(),
  emit: (_: Action) => {
    /* do nothing */
  },
  updates: new Observable<[[State, State], Action, Context]>(),
});

export function useWorkflow() {
  const [state, setState] = useState(createState());
  const { states, emit } = useContext(WorkflowContext);

  useEffect(() => {
    const subscription = states.subscribe((newState) => setState(newState));

    return function cleanup() {
      subscription.unsubscribe();
    };
  });

  return { state, emit };
}

export default WorkflowContext;
