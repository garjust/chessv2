import { Update } from '../../lib/workflow';
import { PieceType } from '../types';
import {
  flipColor,
  isPromotionPositionPawn,
  movesIncludes,
  squareEquals,
} from '../utils';
import { parseFEN, BLANK_POSITION_FEN, formatPosition } from '../lib/fen';
import {
  movePieceAction,
  setPositionFromFENAction,
  overlaySquaresAction,
  setPositionAction,
  attemptComputerMoveAction,
  receiveComputerMoveAction,
  chessComputerLoadedAction,
} from './action';
import { State, Action, Type } from './index';
import {
  SquareOverlayType,
  createState,
  pieceInSquare,
  HumanPlayer,
  checkedSquare,
  Draw,
} from './state';
import { from } from 'rxjs';
import {
  AvailableComputerVersions,
  ChessComputerWorker,
  ChessComputerWorkerConstructor,
} from '../ai/types';
import engine from '../engine';
import { SquareMap } from '../square-map';
import { wrap } from 'comlink';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {};

const COMPUTER_VERISON: AvailableComputerVersions = 'v4';

const loadComputer = async (
  version: AvailableComputerVersions
): Promise<ChessComputerWorker> => {
  const ChessComputerWorkerRemote = wrap<ChessComputerWorkerConstructor>(
    new Worker(new URL('../workers/ai', import.meta.url))
  );
  const instance = await new ChessComputerWorkerRemote();
  await instance.load(version);
  return instance;
};

function handleAttemptComputerMove(state: State): Update<State, Action> {
  const { position, players } = state;
  const playerForTurn = players[position.turn];

  if (playerForTurn !== HumanPlayer) {
    return [
      state,
      from(
        playerForTurn.ai
          .nextMove(formatPosition(position))
          .then((move) => receiveComputerMoveAction(move))
      ),
    ];
  } else {
    return [state, null];
  }
}

function handleChessComputerLoaded(
  state: State,
  action: Action.ChessComputerLoaded
): Update<State, Action> {
  const { instance, color } = action;

  return [
    {
      ...state,
      players: {
        ...state.players,
        [color]: instance,
      },
    },
    attemptComputerMoveAction(),
  ];
}

function handleClickSquare(
  state: State,
  action: Action.ClickSquare
): Update<State, Action> {
  const { square } = action;
  const { position } = state;

  if (state.selectedSquare) {
    if (squareEquals(state.selectedSquare, square)) {
      return [{ ...state, selectedSquare: undefined }, overlaySquaresAction()];
    }

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
  const newOrientation = flipColor(state.boardOrientation);

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
    state,
    from(
      loadComputer(COMPUTER_VERISON).then((instance) =>
        chessComputerLoadedAction(
          { ai: instance, version: COMPUTER_VERISON, __computer: true },
          playingAs
        )
      )
    ),
  ];
}

function handleOverlaySquares(state: State): Update<State, Action> {
  const squareOverlay = new SquareMap<SquareOverlayType>();

  const { position, selectedSquare, lastMove, computedPositionData } = state;

  if (lastMove) {
    squareOverlay.set(lastMove.from, SquareOverlayType.LastMove);
    squareOverlay.set(lastMove.to, SquareOverlayType.LastMove);
  }

  const check = checkedSquare(state);
  if (check) {
    squareOverlay.set(check, SquareOverlayType.Check);
  }

  if (selectedSquare) {
    squareOverlay.set(selectedSquare, SquareOverlayType.SelectedPiece);

    const piece = pieceInSquare(state, selectedSquare);
    if (piece) {
      const candidateSquares = computedPositionData.moveData.moves.filter(
        (move) => squareEquals(move.from, selectedSquare)
      );

      candidateSquares.forEach(({ to: square }) => {
        if (position.pieces.has(square)) {
          squareOverlay.set(square, SquareOverlayType.Capturable);
        } else {
          squareOverlay.set(square, SquareOverlayType.Movable);
        }
      });
    }
  }

  return [{ ...state, squareOverlay }, null];
}

function handlePreviousPosition(state: State): Update<State, Action> {
  let previousPositions = state.previousPositions;
  let work: Action | null = null;

  const position = previousPositions[state.previousPositions.length - 1];
  if (position) {
    previousPositions = previousPositions.slice(0, -1);
    work = setPositionAction(position);
  }

  return [{ ...state, previousPositions, selectedSquare: undefined }, work];
}

function handleReceiveComputerMove(
  state: State,
  action: Action.ReceiveComputerMove
): Update<State, Action> {
  const { move } = action;
  return [state, movePieceAction(move)];
}

function handleResetOverlay(state: State): Update<State, Action> {
  return [{ ...state, squareOverlay: undefined }, null];
}

function handleMovePiece(
  state: State,
  action: Action.MovePiece
): Update<State, Action> {
  const { move } = action;

  const legalMoves = state.computedPositionData.moveData.moves;
  if (!movesIncludes(legalMoves, move)) {
    const piece = pieceInSquare(state, move.from);
    console.log(
      'illegal move!',
      piece,
      move.from,
      '\u2B95',
      move.to,
      state.position
    );
    return [{ ...state, selectedSquare: undefined }, overlaySquaresAction()];
  }

  const pieceToMove = pieceInSquare(state, move.from);
  if (!pieceToMove) {
    throw Error('there should be a piece to move');
  }

  // Check if the move is a promotion. Since there is no UI we need to auto-promot
  // as queen for human players.
  if (
    pieceToMove.type === PieceType.Pawn &&
    isPromotionPositionPawn(pieceToMove.color, move.from) &&
    !move.promotion
  ) {
    move.promotion = PieceType.Queen;
  }

  const { position } = engine.applyMove(state.position, move);

  return [
    {
      ...state,
      lastMove: move,
      previousPositions: [...state.previousPositions, state.position],
    },
    setPositionAction(position),
  ];
}

function handleSetPosition(
  state: State,
  action: Action.SetPosition
): Update<State, Action> {
  const { position } = action;
  const moveData = engine.generateMovementData(position);
  const evaluation = engine.evaluate(position);

  state = {
    ...state,
    position,
    computedPositionData: { moveData, evaluationData: { evaluation } },
  };

  if (position.halfMoveCount === 100) {
    return [
      {
        ...state,
        winner: Draw,
      },
      null,
    ];
  }

  // Check if current player has no moves to end the game
  if (moveData.moves.length === 0) {
    return [
      {
        ...state,
        winner: moveData.checks.length > 0 ? flipColor(position.turn) : Draw,
      },
      null,
    ];
  }

  return [state, from([overlaySquaresAction(), attemptComputerMoveAction()])];
}

function handleSetPositionFromFEN(
  state: State,
  action: Action.SetPositionFromFEN
): Update<State, Action> {
  return [
    { ...state, winner: undefined },
    setPositionAction(parseFEN(action.fenString)),
  ];
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
    case Type.ChessComputerLoaded:
      return handleChessComputerLoaded(state, action);
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
    case Type.PreviousPosition:
      return handlePreviousPosition(state);
    case Type.ReceiveComputerMove:
      return handleReceiveComputerMove(state, action);
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
