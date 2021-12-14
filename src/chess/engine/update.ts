import { Update } from '../../lib/workflow';
import { Color, Square } from '../types';
import { applyMove, squareLabel } from '../utils';
import { STARTING_POSITION_FEN, parseFEN, BLANK_POSITION_FEN } from '../fen';
import {
  movePieceAction,
  setPositionFromFENAction,
  resetOverlayAction,
  overlaySquaresAction,
} from './action';
import { State, Action, Type } from './index';
import { SquareOverlayType, createState } from './state';
import { from } from 'rxjs';
import StringKeyMap from '../../lib/string-key-map';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {};

function handleClickSquare(
  state: State,
  action: Action.ClickSquare
): Update<State, Action> {
  const { square } = action;

  if (state.selectedSquare) {
    return [
      { ...state, selectedSquare: undefined },
      from([
        movePieceAction({
          from: state.selectedSquare,
          to: square,
        }),
        resetOverlayAction(),
      ]),
    ];
  } else {
    // overlayFor;
    // state.squareOverlay.set({ rank: 5, file: 5 }, SquareOverlayType.Movable);
    // state.squareOverlay.set({ rank: 5, file: 6 }, SquareOverlayType.Movable);
    // state.squareOverlay.set({ rank: 5, file: 7 }, SquareOverlayType.Movable);
    // state.squareOverlay.set({ rank: 4, file: 7 }, SquareOverlayType.Capturable);
    return [{ ...state, selectedSquare: square }, overlaySquaresAction()];
  }
}

function handleFlipBoard(state: State): Update<State, Action> {
  const newOrientation =
    state.boardOrientation === Color.White ? Color.Black : Color.White;

  return [{ ...state, boardOrientation: newOrientation }, null];
}

function handleInitialize(
  _state: State,
  action: Action.Initialize
): Update<State, Action> {
  const { playingAs } = action;

  return [
    createState({ humanPlayer: playingAs, boardOrientation: playingAs }),
    setPositionFromFENAction(BLANK_POSITION_FEN),
  ];
}

function handleOverlaySquares(state: State): Update<State, Action> {
  const squareOverlay = new StringKeyMap<Square, SquareOverlayType>(
    squareLabel
  );

  const { selectedSquare } = state;
  if (selectedSquare) {
    squareOverlay.set(selectedSquare, SquareOverlayType.SelectedPiece);
  }

  return [{ ...state, squareOverlay }, null];
}

function handleResetOverlay(state: State): Update<State, Action> {
  return [{ ...state, squareOverlay: undefined }, null];
}

function handleMovePiece(
  state: State,
  action: Action.MovePiece
): Update<State, Action> {
  const { move } = action;
  try {
    const position = applyMove(state.position, move);
    return [{ ...state, position }, null];
  } catch {
    console.log('failed to move piece');
  }

  return [state, null];
}

function handleSetPositionFromFEN(
  state: State,
  action: Action.SetPositionFromFEN
): Update<State, Action> {
  return [{ ...state, position: parseFEN(action.fenString) }, null];
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
    case Type.ClickSquare:
      return handleClickSquare(state, action);
    case Type.FlipBoard:
      return handleFlipBoard(state);
    case Type.Initialize:
      return handleInitialize(state, action);
    case Type.OverlaySquares:
      return handleOverlaySquares(state);
    case Type.ResetOverlay:
      return handleResetOverlay(state);
    case Type.MovePiece:
      return handleMovePiece(state, action);
    case Type.SetPositionFromFEN:
      return handleSetPositionFromFEN(state, action);
    case Type.ToggleSquareLabels:
      return handleToggleSquareLabels(state);
  }
}
