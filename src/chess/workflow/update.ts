import { Update } from '../../lib/workflow';
import { State, Action, Type } from './index';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {};

function handleInitialize(
  state: State,
  action: Action.Initialize
): Update<State, Action> {
  return [state, null];
}

export function update(
  state: State,
  action: Action,
  context: Context
): Update<State, Action> {
  switch (action.type) {
    case Type.Initialize:
      return handleInitialize(state, action);
  }
}
