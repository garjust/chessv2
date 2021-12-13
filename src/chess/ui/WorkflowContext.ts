import React from 'react';
import { Observable } from 'rxjs';
import type { Action, Context, State } from '../workflow';

const WorkflowContext = React.createContext({
  states: new Observable<State>(),
  emit: (_: Action) => {
    /* do nothing */
  },
  updates: new Observable<[[State, State], Action, Context]>(),
});

export default WorkflowContext;
