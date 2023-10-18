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
import Engine from '../engine';
import { play, Sound } from '../ui/audio';
import {
  setOverlayForAttacks,
  setOverlayForPins,
  setOverlayForPlay,
} from './overlay';
import { loadSearchEngine } from '../workers';
import { EVALUATION_DIVIDER } from '../engine/evaluation';
import { Version, LATEST } from '../ai/registry';
import { UCIResponse } from '../lib/uci/uci-response';
import {
  goAction,
  isReadyAction,
  positionAction,
  uciAction,
  uciNewGameAction,
} from '../lib/uci';

export type Context = {
  engine: Engine;
};

const COMPUTER_VERSION: Version = LATEST;

function handleAttemptComputerMove(state: State): Update<State, Action> {
  const { position, players } = state;
  const playerForTurn = players[position.turn];

  if (playerForTurn !== HumanPlayer) {
    playerForTurn.searchEngine.emit(
      // TODO: pass moves?
      positionAction(formatPosition(state.position), []),
    );
    return [
      state,
      () =>
        from(
          playerForTurn.searchEngine
            // TODO: wait for result somehow
            .emit(
              goAction({
                depth: 10,
              }),
            )
            .then(async (move) => {
              const diagnostics =
                await playerForTurn.searchEngine.diagnosticsResult;
              console.log(diagnostics?.logString, diagnostics);

              return move;
            })
            .then((move) =>
              // TODO: fix move
              receiveComputerMoveAction({
                from: 0,
                to: 0,
              }),
            ),
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

  return [{ ...state, overlayCategory: nextCategory }, overlaySquaresAction];
}

function handleChessComputerLoaded(
  state: State,
  action: Action.ChessComputerLoaded,
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
    attemptComputerMoveAction,
  ];
}

function handleClickSquare(
  state: State,
  action: Action.ClickSquare,
): Update<State, Action> {
  const { square } = action;
  const { position } = state;

  if (state.selectedSquare !== undefined) {
    const selectedSquare = state.selectedSquare;

    if (selectedSquare === square) {
      return [{ ...state, selectedSquare: undefined }, overlaySquaresAction];
    }

    return [
      { ...state, selectedSquare: undefined },
      () =>
        movePieceAction({
          from: selectedSquare,
          to: square,
        }),
    ];
  } else {
    // Nothing is already selected so attempt to "select" the square.
    if (pieceInSquare(state, square)?.color === position.turn) {
      return [{ ...state, selectedSquare: square }, overlaySquaresAction];
    }
  }

  return [state, overlaySquaresAction];
}

function handleFlipBoard(state: State): Update<State, Action> {
  const newOrientation = flipColor(state.boardOrientation);

  return [{ ...state, boardOrientation: newOrientation }, null];
}

function handleLoadChessComputer(
  state: State,
  action: Action.LoadChessComputer,
): Update<State, Action> {
  const { playingAs } = action;
  const { players } = state;
  const player = players[playingAs];

  if (player === HumanPlayer) {
    const responseFunc = (response: UCIResponse) => {};
    return [
      state,
      () =>
        from(
          loadSearchEngine(COMPUTER_VERSION, 10, responseFunc)
            .then(([instance, cleanup]) => {
              instance.emit(uciAction());
              // TOOD: wait for uciok

              instance.emit(uciNewGameAction());
              instance.emit(isReadyAction());
              // TODO: wait for the readyok somehow.
              return Promise.all([instance, cleanup, instance.label]);
            })
            .then(([instance, cleanup, label]) =>
              chessComputerLoadedAction(
                {
                  searchEngine: instance,
                  responseFunc,
                  label,
                  cleanup,
                  __computer: true,
                },
                playingAs,
              ),
            ),
        ),
    ];
  } else {
    player.cleanup();
    return [
      { ...state, players: { ...players, [playingAs]: HumanPlayer } },
      null,
    ];
  }
}

function handleOverlaySquares(
  state: State,
  context: Context,
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
  { engine }: Context,
): Update<State, Action> {
  engine.undoLastMove();
  play(Sound.Move);

  return [
    { ...state, selectedSquare: undefined },
    () => setPositionAction(engine.position),
  ];
}

function handleReceiveComputerMove(
  state: State,
  action: Action.ReceiveComputerMove,
): Update<State, Action> {
  const { move } = action;
  return [state, () => movePieceAction(move)];
}

function handleResetOverlay(state: State): Update<State, Action> {
  return [{ ...state, squareOverlay: undefined }, null];
}

function handleMovePiece(
  state: State,
  action: Action.MovePiece,
  { engine }: Context,
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
      state.position,
    );
    return [{ ...state, selectedSquare: undefined }, overlaySquaresAction];
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
      clocks: {
        ...state.clocks,
        [state.position.turn]:
          state.clocks[state.position.turn] + state.clocks.plusTime * 1000,
      },
      lastMove: move,
    },
    () => setPositionAction(engine.position),
  ];
}

function handleSetPosition(
  state: State,
  action: Action.SetPosition,
  { engine }: Context,
): Update<State, Action> {
  const { position } = action;
  const moves = engine.generateMoves();
  const evaluation = engine.evaluate() / EVALUATION_DIVIDER;
  const zobrist = engine.zobrist;
  const checks = engine.checks(position.turn);

  state = {
    ...state,
    position,
    moves,
    evaluation,
    checks,
    zobrist,
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
      overlaySquaresAction,
    ];
  }

  if (checks.length > 0) {
    play(Sound.Check);
  }

  return [
    state,
    () => from([overlaySquaresAction(), attemptComputerMoveAction()]),
  ];
}

function handleSetPositionFromFEN(
  state: State,
  action: Action.SetPositionFromFEN,
  { engine }: Context,
): Update<State, Action> {
  const position = parseFEN(action.fenString);
  engine.position = position;

  return [{ ...state, winner: undefined }, () => setPositionAction(position)];
}

function handleTickPlayersClock(state: State): Update<State, Action> {
  const { position, clocks } = state;
  const tick = Date.now();

  const turnClock = clocks[position.turn];

  state = {
    ...state,
    clocks: {
      ...clocks,
      lastTick: tick,
    },
  };

  if (turnClock > 0) {
    state.clocks[position.turn] = Math.max(
      turnClock - (tick - clocks.lastTick),
      0,
    );
  }

  if (state.clocks[position.turn] <= 0) {
    state = { ...state, winner: flipColor(position.turn) };
  }

  return [state, null];
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

export const update =
  (context: Context) =>
  (state: State, action: Action): Update<State, Action> => {
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
      case Type.TickPlayersClock:
        return handleTickPlayersClock(state);
      case Type.ToggleSquareLabels:
        return handleToggleSquareLabels(state);
    }
  };
