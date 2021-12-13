import { Update } from '../../lib/workflow';
import { Color, PieceType } from '../types';
import {
  buildBoard,
  parseFEN,
  setPosition,
  STARTING_POSITION_FEN,
} from '../utils';
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
  const board = buildBoard();

  return [
    { ...state, humanPlayer: playingAs, boardOrientation: playingAs, board },
    setPositionFromFENAction(STARTING_POSITION_FEN),
  ];
}

function handleSetPositionFromFEN(
  state: State,
  action: Action.SetPositionFromFEN
): Update<State, Action> {
  const fen = parseFEN(action.fenString);
  console.log('FEN', fen);

  setPosition(state.board, [
    {
      squareDef: { rank: 0, file: 0 },
      piece: { color: Color.White, type: PieceType.King },
    },
    {
      squareDef: { rank: 5, file: 7 },
      piece: { color: Color.Black, type: PieceType.King },
    },
    {
      squareDef: { rank: 0, file: 4 },
      piece: { color: Color.White, type: PieceType.Knight },
    },
    {
      squareDef: { rank: 5, file: 5 },
      piece: { color: Color.White, type: PieceType.Knight },
    },
    {
      squareDef: { rank: 1, file: 0 },
      piece: { color: Color.Black, type: PieceType.Rook },
    },
    {
      squareDef: { rank: 6, file: 6 },
      piece: { color: Color.Black, type: PieceType.Queen },
    },
  ]);

  return [state, null];
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
    case Type.SetPositionFromFEN:
      return handleSetPositionFromFEN(state, action);
    case Type.ToggleSquareLabels:
      return handleToggleSquareLabels(state);
  }
}
