import { Update } from '../../../lib/workflow';
import { Color, PieceType, Square } from '../../types';
import { flipColor, isPromotionPositionPawn, movesIncludes } from '../../utils';
import { parseFEN, formatPosition } from '../../lib/fen';
import {
  Type,
  movePieceAction,
  overlaySquaresAction,
  setPositionAction,
  attemptComputerMoveAction,
  receiveComputerMoveAction,
  chessComputerLoadedAction,
  ChessComputerLoadedAction,
  ClickSquareAction,
  LoadChessComputerAction,
  ReceiveComputerMoveAction,
  MovePieceAction,
  SetPositionAction,
  SetPositionFromFENAction,
  EngineResponseAction,
  engineResponseAction,
} from './action';
import { State, Action } from './index';
import {
  SquareOverlayType,
  pieceInSquare,
  HumanPlayer,
  Draw,
  SquareLabel,
  SquareOverlayCategory,
  UCIState,
  EngineInstance,
  getEngineInstance,
  engineStateAs,
  isWaitingForEngine,
} from './state';
import { from, map, merge } from 'rxjs';
import Core from '../../core';
import { play, Sound } from '../audio';
import {
  setOverlayForAttacks,
  setOverlayForPins,
  setOverlayForPlay,
} from './overlay';
import { EVALUATION_DIVIDER } from '../../core/evaluation';
import { Version, LATEST } from '../../engine/registry';
import { UCIResponseType } from '../../engine/workflow/uci-response';
import * as EngineWorkflow from '../../engine/workflow';
import { Engine } from '../../engine/engine';
import { delayEmit } from '../../../lib/workflow/util';

export type Context = {
  core: Core;
};

const COMPUTER_VERSION: Version = LATEST;

function handleAttemptComputerMove(state: State): Update<State, Action> {
  const { position, players } = state;
  const playerForTurn = players[position.turn];

  if (playerForTurn !== HumanPlayer) {
    const instance = getEngineInstance(state, playerForTurn.engineId);
    validateState(instance, UCIState.Idle);

    return [
      engineStateAs(state, instance.id, UCIState.WaitingForMove),
      () =>
        delayEmit(
          instance.engine,
          // TODO: provide moves so far & pass "startpos"
          EngineWorkflow.positionAction(formatPosition(state.position), []),
          EngineWorkflow.goAction(),
        ),
    ];
  }

  return [state, null];
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
  action: ChessComputerLoadedAction,
): Update<State, Action> {
  const { instance, color } = action;

  instance.uciState = UCIState.WaitingForUCIOk;

  return [
    {
      ...state,
      engines: Object.assign({}, state.engines, {
        [instance.id]: instance,
      }),
      players: {
        ...state.players,
        [color]: { engineId: instance.id },
      },
    },
    () =>
      merge(
        // Here is where we link the workflows together by returning an
        // observable here parent actions mapped from child actions.
        instance.engine.responses.pipe(
          map((response) => {
            return engineResponseAction(instance.id, response);
          }),
        ),
        from(delayEmit(instance.engine, EngineWorkflow.uciAction())),
      ),
  ];
}

function handleClickSquare(
  state: State,
  action: ClickSquareAction,
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

const validateState = (engine: EngineInstance, state: UCIState): void => {
  if (engine.uciState !== state) {
    throw Error(`engine ${engine.label} not in state ${state}`);
  }
};

function handleEngineResponse(
  state: State,
  action: EngineResponseAction,
): Update<State, Action> {
  const instance = getEngineInstance(state, action.engineId);

  const response = action.response;
  switch (response.type) {
    case UCIResponseType.UCIOk:
      validateState(instance, UCIState.WaitingForUCIOk);

      return [
        engineStateAs(state, instance.id, UCIState.WaitingForReadyOk),
        () => delayEmit(instance.engine, EngineWorkflow.isReadyAction()),
      ];
    case UCIResponseType.ReadyOk:
      validateState(instance, UCIState.WaitingForReadyOk);

      return [
        engineStateAs(state, instance.id, UCIState.Idle),
        isWaitingForEngine(state, instance.id)
          ? attemptComputerMoveAction
          : null,
      ];

    case UCIResponseType.BestMove:
      validateState(instance, UCIState.WaitingForMove);
      console.log(
        instance.engine.diagnosticsResult?.logString,
        instance.engine.diagnosticsResult,
      );

      return [
        engineStateAs(state, instance.id, UCIState.Idle),
        () => receiveComputerMoveAction(response.move),
      ];
  }

  return [state, null];
}

function handleFlipBoard(state: State): Update<State, Action> {
  const newOrientation = flipColor(state.boardOrientation);

  return [{ ...state, boardOrientation: newOrientation }, null];
}

function createEngineId() {
  return `engine-${Math.trunc(Math.random() * 1000000)}`;
}

function handleLoadChessComputer(
  state: State,
  action: LoadChessComputerAction,
): Update<State, Action> {
  const { playingAs } = action;
  const { players } = state;
  const player = players[playingAs];

  if (player === HumanPlayer) {
    const engine = new Engine(COMPUTER_VERSION, 10);

    return [
      state,
      () =>
        chessComputerLoadedAction(
          {
            id: createEngineId(),
            label: engine.label,
            uciState: UCIState.Idle,
            engine,
            __computer: true,
          },
          playingAs,
        ),
    ];
  } else {
    // const instance = getEngineInstance(state, player.engineId);
    // TODO: remove old engine.
    // TODO: check if I need to cleanup the webworkers inside the engine.
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
      setOverlayForAttacks(squareOverlay, context.core.attacks[Color.White]);
      break;
    case SquareOverlayCategory.AttacksForBlack:
      setOverlayForAttacks(squareOverlay, context.core.attacks[Color.Black]);
      break;
    case SquareOverlayCategory.Pins:
      setOverlayForPins(squareOverlay, context.core.pins);
      break;
  }

  return [{ ...state, squareOverlay }, null];
}

function handlePreviousPosition(
  state: State,
  { core: engine }: Context,
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
  action: ReceiveComputerMoveAction,
): Update<State, Action> {
  const { move } = action;
  return [state, () => movePieceAction(move)];
}

function handleResetOverlay(state: State): Update<State, Action> {
  return [{ ...state, squareOverlay: undefined }, null];
}

function handleMovePiece(
  state: State,
  action: MovePieceAction,
  { core: engine }: Context,
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
  action: SetPositionAction,
  { core: engine }: Context,
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
  action: SetPositionFromFENAction,
  { core: engine }: Context,
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
      case Type.EngineResponse:
        return handleEngineResponse(state, action);
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
