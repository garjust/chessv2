import { Update } from '../../lib/workflow';
import { Color } from '../types';
import { applyMove } from '../utils';
import { STARTING_POSITION_FEN, parseFEN } from '../fen';
import { setPositionFromFENAction } from './action';
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
  const { playingAs } = action;

  return [
    { ...state, humanPlayer: playingAs, boardOrientation: playingAs },
    setPositionFromFENAction(STARTING_POSITION_FEN),
  ];
}

function handleMovePiece(
  state: State,
  action: Action.MovePiece
): Update<State, Action> {
  const { move } = action;
  const position = applyMove(state.position, move);

  return [{ ...state, position }, null];
}

function handleSetPositionFromFEN(
  state: State,
  action: Action.SetPositionFromFEN
): Update<State, Action> {
  const position = parseFEN(action.fenString);
  // setPosition(state.board, position.pieces);

  return [{ ...state, position }, null];
}

function handleToggleSquareLabels(state: State): Update<State, Action> {
  return [{ ...state, displaySquareLabels: !state.displaySquareLabels }, null];
}

export function update(
  state: State,
  action: Action,
  _context: Context
): Update<State, Action> {
  switch (action.type) {
    case Type.FlipBoard:
      return handleFlipBoard(state);
    case Type.Initialize:
      return handleInitialize(state, action);
    case Type.MovePiece:
      return handleMovePiece(state, action);
    case Type.SetPositionFromFEN:
      return handleSetPositionFromFEN(state, action);
    case Type.ToggleSquareLabels:
      return handleToggleSquareLabels(state);
  }
}
