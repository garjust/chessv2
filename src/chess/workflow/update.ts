import { Update } from '../../lib/workflow';
import { Color } from '../color';
import { State, Action, Type } from './index';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {};

function handleFlipBoard(state: State): Update<State, Action> {
  const newOrientation =
    state.boardOrientation === Color.White ? Color.Black : Color.White;

  return [{ ...state, boardOrientation: newOrientation }, null];
}

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
    case Type.FlipBoard:
      return handleFlipBoard(state);
    case Type.Initialize:
      return handleInitialize(state, action);
  }
}
