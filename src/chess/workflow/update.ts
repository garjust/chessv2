import { Update } from '../../lib/workflow';
import { Color, PieceType, Square } from '../types';
import { flipColor, isPromotionPositionPawn, movesIncludes } from '../utils';
import { parseFEN, formatPosition } from '../lib/fen';
import {
  movePieceAction,
  overlaySquaresAction,
  setPositionAction,
  attemptComputerMoveAction,
  receiveComputerMoveAction,
  chessComputerLoadedAction,
} from './action';
import { State, Action, Type } from './index';
import {
  SquareOverlayType,
  pieceInSquare,
  HumanPlayer,
  Draw,
  SquareLabel,
  SquareOverlayCategory,
} from './state';
import { from } from 'rxjs';
import { AvailableComputerVersions } from '../ai/types';
import Engine from '../engine';
import { play, Sound } from '../ui/audio';
import {
  setOverlayForAttacks,
  setOverlayForPins,
  setOverlayForPlay,
} from './overlay';
import { loadComputer } from '../workers';
import { EVALUATION_DIVIDER } from '../engine/evaluation';

export type Context = {
  engine: Engine;
};

const COMPUTER_VERISON: AvailableComputerVersions = 'v6';

function handleAttemptComputerMove(state: State): Update<State, Action> {
  const { position, players } = state;
  const playerForTurn = players[position.turn];

  if (playerForTurn !== HumanPlayer) {
    return [
      state,
      from(
        playerForTurn.ai
          .nextMove(position)
          .then((move) => receiveComputerMoveAction(move))
      ),
    ];
  } else {
    return [state, null];
  }
}

function handleChangeOverlay(state: State): Update<State, Action> {
  let nextCategory: SquareOverlayCategory;

  switch (state.overlayCategory) {
    case SquareOverlayCategory.Play:
      nextCategory = SquareOverlayCategory.AttacksForWhite;
      break;
    case SquareOverlayCategory.AttacksForWhite:
      nextCategory = SquareOverlayCategory.AttacksForBlack;
      break;
    case SquareOverlayCategory.AttacksForBlack:
      nextCategory = SquareOverlayCategory.Pins;
      break;
    case SquareOverlayCategory.Pins:
      nextCategory = SquareOverlayCategory.Heatmap;
      break;
    case SquareOverlayCategory.Heatmap:
      nextCategory = SquareOverlayCategory.Play;
      break;
  }

  return [{ ...state, overlayCategory: nextCategory }, overlaySquaresAction()];
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

  if (state.selectedSquare !== undefined) {
    if (state.selectedSquare === square) {
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

function handleLoadChessComputer(
  state: State,
  action: Action.LoadChessComputer
): Update<State, Action> {
  const { playingAs } = action;

  return [
    state,
    from(
      loadComputer(COMPUTER_VERISON)
        .then((instance) => {
          return Promise.all([instance, instance.toJSON()]);
        })
        .then(([instance, label]) =>
          chessComputerLoadedAction(
            { ai: instance, label, __computer: true },
            playingAs
          )
        )
    ),
  ];
}

function handleOverlaySquares(
  state: State,
  context: Context
): Update<State, Action> {
  const squareOverlay = new Map<Square, SquareOverlayType>();
  const { overlayCategory } = state;

  switch (overlayCategory) {
    case SquareOverlayCategory.Play:
      setOverlayForPlay(squareOverlay, state);
      break;
    case SquareOverlayCategory.AttacksForWhite:
      setOverlayForAttacks(squareOverlay, context.engine.attacks[Color.White]);
      break;
    case SquareOverlayCategory.AttacksForBlack:
      setOverlayForAttacks(squareOverlay, context.engine.attacks[Color.Black]);
      break;
    case SquareOverlayCategory.Pins:
      setOverlayForPins(squareOverlay, context.engine.pins);
      break;
  }

  return [{ ...state, squareOverlay }, null];
}

function handlePreviousPosition(
  state: State,
  { engine }: Context
): Update<State, Action> {
  engine.undoLastMove();

  return [
    { ...state, selectedSquare: undefined },
    setPositionAction(engine.position),
  ];
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
  action: Action.MovePiece,
  { engine }: Context
): Update<State, Action> {
  const { move } = action;
  const legalMoves = state.moves;

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

  const captured = engine.applyMove(move);
  if (captured) {
    play(Sound.Capture);
  } else {
    play(Sound.Move);
  }

  return [
    {
      ...state,
      lastMove: move,
    },
    setPositionAction(engine.position),
  ];
}

function handleSetPosition(
  state: State,
  action: Action.SetPosition,
  { engine }: Context
): Update<State, Action> {
  const { position } = action;
  const moves = engine.generateMoves();
  const evaluation = engine.evaluate() / EVALUATION_DIVIDER;
  const checks = engine.checks[position.turn];

  state = {
    ...state,
    position,
    moves,
    evaluation,
    checks,
  };

  if (position.halfMoveCount === 100) {
    play(Sound.Draw);
    return [
      {
        ...state,
        winner: Draw,
      },
      null,
    ];
  }

  // Check if current player has no moves to end the game
  if (position.pieces.size > 0 && moves.length === 0) {
    const winner = checks.length > 0 ? flipColor(position.turn) : Draw;
    if (winner === Draw) {
      play(Sound.Draw);
    } else if (winner === Color.White) {
      play(Sound.Win);
    } else if (winner === Color.Black) {
      play(Sound.Lose);
    }

    return [
      {
        ...state,
        winner,
      },
      overlaySquaresAction(),
    ];
  }

  if (checks.length > 0) {
    play(Sound.Check);
  }

  return [state, from([overlaySquaresAction(), attemptComputerMoveAction()])];
}

function handleSetPositionFromFEN(
  state: State,
  action: Action.SetPositionFromFEN,
  { engine }: Context
): Update<State, Action> {
  const position = parseFEN(action.fenString);
  engine.position = position;

  return [{ ...state, winner: undefined }, setPositionAction(position)];
}

function handleToggleSquareLabels(state: State): Update<State, Action> {
  const { squareLabels } = state;

  let nextLabel: SquareLabel;
  switch (squareLabels) {
    case SquareLabel.None:
      nextLabel = SquareLabel.Square;
      break;
    case SquareLabel.Square:
      nextLabel = SquareLabel.Index;
      break;
    case SquareLabel.Index:
      nextLabel = SquareLabel.None;
      break;
  }

  return [{ ...state, squareLabels: nextLabel }, null];
}

export function update(
  state: State,
  action: Action,
  context: Context
): Update<State, Action> {
  if (state.debugVersion != undefined) {
    state = { ...state, debugVersion: state.debugVersion + 1 };
  }

  switch (action.type) {
    case Type.AttemptComputerMove:
      return handleAttemptComputerMove(state);
    case Type.ChangeOverlay:
      return handleChangeOverlay(state);
    case Type.ChessComputerLoaded:
      return handleChessComputerLoaded(state, action);
    case Type.ClickSquare:
      return handleClickSquare(state, action);
    case Type.FlipBoard:
      return handleFlipBoard(state);
    case Type.LoadChessComputer:
      return handleLoadChessComputer(state, action);
    case Type.OverlaySquares:
      return handleOverlaySquares(state, context);
    case Type.PreviousPosition:
      return handlePreviousPosition(state, context);
    case Type.ReceiveComputerMove:
      return handleReceiveComputerMove(state, action);
    case Type.ResetOverlay:
      return handleResetOverlay(state);
    case Type.MovePiece:
      return handleMovePiece(state, action, context);
    case Type.SetPosition:
      return handleSetPosition(state, action, context);
    case Type.SetPositionFromFEN:
      return handleSetPositionFromFEN(state, action, context);
    case Type.ToggleSquareLabels:
      return handleToggleSquareLabels(state);
  }
}
