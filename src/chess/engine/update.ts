import { Update } from '../../lib/workflow';
import { Color } from '../types';
import { SquareMap } from '../utils';
import { applyMove, findSquaresForMove } from '../movement';
import { parseFEN, BLANK_POSITION_FEN } from '../fen';
import {
  movePieceAction,
  setPositionFromFENAction,
  resetOverlayAction,
  overlaySquaresAction,
} from './action';
import { State, Action, Type } from './index';
import { SquareOverlayType, createState, pieceInSquare } from './state';
import { from } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {};

function handleClickSquare(
  state: State,
  action: Action.ClickSquare
): Update<State, Action> {
  const { square } = action;
  const { position } = state;

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
    // Nothing is already selected so attempt to "select" the square.
    if (pieceInSquare(state, square)?.color === position.turn) {
      return [{ ...state, selectedSquare: square }, overlaySquaresAction()];
    }
  }

  return [state, null];
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
  const squareOverlay = new SquareMap<SquareOverlayType>();

  const { position, selectedSquare } = state;
  if (selectedSquare) {
    squareOverlay.set(selectedSquare, SquareOverlayType.SelectedPiece);

    const candidateSquares = findSquaresForMove(state.position, selectedSquare);
    candidateSquares.forEach((square) => {
      if (position.pieces.has(square)) {
        squareOverlay.set(square, SquareOverlayType.Capturable);
      } else {
        squareOverlay.set(square, SquareOverlayType.Movable);
      }
    });
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
  } catch (error) {
    console.log(`failed to move piece: ${error}`);
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
