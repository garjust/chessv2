import { Update } from '../../lib/workflow';
import {
  Color,
  ComputedPositionData,
  Move,
  PieceType,
  Position,
} from '../types';
import { SquareMap } from '../utils';
import { applyMove, checkedSquare, computeMovementData } from '../movement';
import { parseFEN, BLANK_POSITION_FEN } from '../fen';
import {
  movePieceAction,
  setPositionFromFENAction,
  overlaySquaresAction,
  setPositionAction,
  attemptComputerMoveAction,
  clickSquareAction,
} from './action';
import { State, Action, Type } from './index';
import {
  SquareOverlayType,
  createState,
  pieceInSquare,
  HumanPlayer,
} from './state';
import { evaluate } from '../evaluation';
import { v2 } from '../ai';
import { from } from 'rxjs';
import { delayOperator } from '../../lib/operators';
import { ChessComputer } from '../ai/types';
import { board } from '../bitmap';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {};

const loadComputer = (): ChessComputer => new v2();

function computeAll(position: Position): ComputedPositionData {
  return {
    ...computeMovementData(position),
    evaluation: evaluate(position),
    bitmaps: {
      whitePieces: board(position, { color: Color.White }),
      blackPieces: board(position, { color: Color.Black }),
      // bishops____: board(position, { pieceType: PieceType.Bishop }),
      // kings______: board(position, { pieceType: PieceType.King }),
      // knight_____: board(position, { pieceType: PieceType.Knight }),
      // pawns______: board(position, { pieceType: PieceType.Pawn }),
      // queens_____: board(position, { pieceType: PieceType.Queen }),
      // rooks______: board(position, { pieceType: PieceType.Rook }),
    },
  };
}

function handleAttemptComputerMove(state: State): Update<State, Action> {
  const { position, players, computedPositionData } = state;
  const playerForTurn = players[position.turn];
  let move: Move;

  if (playerForTurn !== HumanPlayer) {
    move = playerForTurn.nextMove(position, computedPositionData);
  } else {
    return [state, null];
  }

  return [
    state,
    from([clickSquareAction(move.from), clickSquareAction(move.to)]).pipe(
      delayOperator(400)
    ),
  ];
}

function handleClickSquare(
  state: State,
  action: Action.ClickSquare
): Update<State, Action> {
  const { square } = action;
  const { position } = state;

  if (state.selectedSquare) {
    return [
      { ...state, selectedSquare: undefined },
      movePieceAction({
        from: state.selectedSquare,
        to: square,
      }),
    ];
  } else {
    // Nothing is already selected so attempt to "select" the square.
    if (pieceInSquare(state, square)?.color === position.turn) {
      return [{ ...state, selectedSquare: square }, overlaySquaresAction()];
    }
  }

  return [state, overlaySquaresAction()];
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

  return [createState({}), setPositionFromFENAction(BLANK_POSITION_FEN)];
}

function handleLoadChessComputer(
  state: State,
  action: Action.LoadChessComputer
): Update<State, Action> {
  const { playingAs } = action;

  return [
    { ...state, players: { ...state.players, [playingAs]: loadComputer() } },
    attemptComputerMoveAction(),
  ];
}

function handleOverlaySquares(state: State): Update<State, Action> {
  const squareOverlay = new SquareMap<SquareOverlayType>();

  const { position, selectedSquare } = state;

  const check = checkedSquare(position);
  if (check) {
    squareOverlay.set(check, SquareOverlayType.Check);
  }

  if (selectedSquare) {
    squareOverlay.set(selectedSquare, SquareOverlayType.SelectedPiece);

    const piece = pieceInSquare(state, selectedSquare);
    if (piece) {
      const candidateSquares = state.computedPositionData?.movesByPiece
        .get(piece.type)
        ?.get(selectedSquare);

      if (candidateSquares) {
        candidateSquares.forEach(({ to: square }) => {
          if (position.pieces.has(square)) {
            squareOverlay.set(square, SquareOverlayType.Capturable);
          } else {
            squareOverlay.set(square, SquareOverlayType.Movable);
          }
        });
      }
    }
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
  let position;

  try {
    position = applyMove(state.position, move);
  } catch (error) {
    console.log(`failed to move piece: ${error}`);
  }

  if (position) {
    return [state, setPositionAction(position)];
  } else {
    return [state, overlaySquaresAction()];
  }
}

function handleSetPosition(
  state: State,
  action: Action.SetPosition
): Update<State, Action> {
  const { position } = action;
  const computedPositionData = computeAll(position);

  return [
    { ...state, position, computedPositionData },
    from([overlaySquaresAction(), attemptComputerMoveAction()]),
  ];
}

function handleSetPositionFromFEN(
  state: State,
  action: Action.SetPositionFromFEN
): Update<State, Action> {
  return [state, setPositionAction(parseFEN(action.fenString))];
}

function handleToggleSquareLabels(state: State): Update<State, Action> {
  return [{ ...state, displaySquareLabels: !state.displaySquareLabels }, null];
}

export function update(
  state: State,
  action: Action,
  _context: Context
): Update<State, Action> {
  if (state.debugVersion != undefined) {
    state = { ...state, debugVersion: state.debugVersion + 1 };
  }

  switch (action.type) {
    case Type.AttemptComputerMove:
      return handleAttemptComputerMove(state);
    case Type.ClickSquare:
      return handleClickSquare(state, action);
    case Type.FlipBoard:
      return handleFlipBoard(state);
    case Type.Initialize:
      return handleInitialize(state, action);
    case Type.LoadChessComputer:
      return handleLoadChessComputer(state, action);
    case Type.OverlaySquares:
      return handleOverlaySquares(state);
    case Type.ResetOverlay:
      return handleResetOverlay(state);
    case Type.MovePiece:
      return handleMovePiece(state, action);
    case Type.SetPosition:
      return handleSetPosition(state, action);
    case Type.SetPositionFromFEN:
      return handleSetPositionFromFEN(state, action);
    case Type.ToggleSquareLabels:
      return handleToggleSquareLabels(state);
  }
}
