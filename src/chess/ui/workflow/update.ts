import { Update } from '../../../rx-workflow';
import { Color, PieceType, Square } from '../../types';
import {
  flipColor,
  isPositionEqual,
  isPromotionPositionPawn,
} from '../../utils';
import { parseFEN, FEN_LIBRARY } from '../../lib/fen';
import {
  Type,
  movePieceAction,
  overlaySquaresAction,
  setPositionAction,
  attemptEngineMoveAction,
  receiveEngineMoveAction,
  loadEngineDoneAction,
  engineResponseAction,
  Navigate,
  navigatePositionAction,
  loadEngineAction,
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
  engineInstance,
  isDisplayingCurrentPosition,
  validateEngineInstanceState,
  gameIsOver,
} from './state';
import { catchError, from, map, merge, of } from 'rxjs';
import Core from '../../core';
import { play, Sound } from '../audio';
import {
  setOverlayForAttacks,
  setOverlayForPins,
  setOverlayForPlay,
} from './overlay';
import { EVALUATION_DIVIDER } from '../../core/evaluation';
import { LATEST } from '../../engine/search-executor';
import { Version } from '../../engine/search-executor';
import { UCIResponseType, toUCI } from '../../engine/workflow/uci-response';
import * as EngineWorkflow from '../../engine/workflow';
import { Engine } from '../../engine/engine';
import { delayEmit } from '../../../rx-workflow/util';
import Logger from '../../../lib/logger';
import { moveString } from '../../move-notation';
import { Command } from '../../../rx-workflow/commands';
import { movesIncludes } from '../../core/move-utils';

export type Context = {
  core: Core;
  debug: boolean;
};

const logger = new Logger('ui-workflow');

const ENGINE_VERSION: Version = LATEST;

function handleAttemptEngineMove(state: State): Update<State, Action> {
  if (gameIsOver(state)) {
    return [state, null];
  }

  const playerForTurn = state.game.players[state.game.turn];

  if (playerForTurn !== HumanPlayer) {
    const instance = getEngineInstance(state, playerForTurn.engineId);
    validateEngineInstanceState(instance, UCIState.Idle);

    return [
      engineStateAs(state, instance.id, UCIState.WaitingForMove),
      () =>
        delayEmit(
          instance.engine.workflow,
          EngineWorkflow.positionAction(
            state.game.startFen,
            state.game.moveList,
          ),
          EngineWorkflow.goAction({
            depth: 10,
            nodes: 20000000,
            movetime: 1000,
          }),
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

function handleClickSquare(
  state: State,
  action: Action & { type: Type.ClickSquare },
): Update<State, Action> {
  if (action.alternate) {
    let squareOverlay = state.squareOverlay;
    if (state.selectedSquare !== null) {
      squareOverlay = {};
    }

    squareOverlay[action.square] = SquareOverlayType.Attacked;

    return [{ ...state, selectedSquare: null, squareOverlay }, null];
  } else {
    if (state.selectedSquare !== null) {
      const selectedSquare = state.selectedSquare;

      if (selectedSquare === action.square) {
        return [{ ...state, selectedSquare: null }, overlaySquaresAction];
      }

      return [
        { ...state, selectedSquare: null },
        () =>
          movePieceAction({
            from: selectedSquare,
            to: action.square,
          }),
      ];
    } else {
      // Nothing is already selected so attempt to "select" the square.
      if (
        pieceInSquare(state, action.square)?.color === state.game.position.turn
      ) {
        return [
          { ...state, selectedSquare: action.square },
          overlaySquaresAction,
        ];
      } else {
        return [state, overlaySquaresAction];
      }
    }
  }
}

function handleEngineResponse(
  state: State,
  action: Action & { type: Type.EngineResponse },
): Update<State, Action> {
  const instance = getEngineInstance(state, action.engineId);

  const response = action.response;
  switch (response.type) {
    case UCIResponseType.Id:
      return [
        {
          ...state,
          engines: {
            ...state.engines,
            [instance.id]: {
              ...state.engines[instance.id],
              label: response.name,
            },
          },
        },
        null,
      ];
    case UCIResponseType.Info:
      logger.debug(
        `uci-info ${action.engineId}\n`,
        `${toUCI(response).join()}`,
      );
      return [state, null];
    case UCIResponseType.Option:
      return [state, null];
    case UCIResponseType.UCIOk:
      validateEngineInstanceState(instance, UCIState.WaitingForUCIOk);

      return [
        engineStateAs(state, instance.id, UCIState.WaitingForReadyOk),
        () =>
          delayEmit(
            instance.engine.workflow,
            EngineWorkflow.setOptionAction({ name: 'Hash', value: 256 }),
            EngineWorkflow.isReadyAction(),
          ),
      ];
    case UCIResponseType.ReadyOk:
      validateEngineInstanceState(instance, UCIState.WaitingForReadyOk);

      return [
        engineStateAs(state, instance.id, UCIState.Idle),
        isWaitingForEngine(state, instance.id) ? attemptEngineMoveAction : null,
      ];
    case UCIResponseType.BestMove:
      validateEngineInstanceState(instance, UCIState.WaitingForMove);

      return [
        engineStateAs(state, instance.id, UCIState.Idle),
        () => receiveEngineMoveAction(response.move),
      ];
    default:
      throw Error(`dont know how to handle UCIResponse ${response.type}`);
  }
}

function handleFlipBoard(state: State): Update<State, Action> {
  return [
    { ...state, boardOrientation: flipColor(state.boardOrientation) },
    null,
  ];
}

function handleLoadEngine(
  state: State,
  action: Action & { type: Type.LoadEngine },
  context: Context,
): Update<State, Action> {
  const { playingAs } = action;
  const player = state.game.players[playingAs];

  if (player === HumanPlayer) {
    const engine = new Engine(ENGINE_VERSION, context.debug);

    return [
      state,
      () => loadEngineDoneAction(engineInstance(engine), playingAs),
    ];
  } else {
    const instance = getEngineInstance(state, player.engineId);
    instance.engine.workflow.emit(Command.Done);

    const engines: Record<string, EngineInstance> = { ...state.engines };
    delete engines[player.engineId];

    return [
      {
        ...state,
        engines,
        game: {
          ...state.game,
          players: { ...state.game.players, [playingAs]: HumanPlayer },
        },
      },
      null,
    ];
  }
}

function handleLoadEngineDone(
  state: State,
  action: Action & { type: Type.LoadEngineDone },
): Update<State, Action> {
  const { instance, color } = action;

  instance.uciState = UCIState.WaitingForUCIOk;

  return [
    {
      ...state,
      engines: Object.assign({}, state.engines, {
        [instance.id]: instance,
      }),
      game: {
        ...state.game,
        players: {
          ...state.game.players,
          [color]: { engineId: instance.id },
        },
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
          // TODO: add an "unload" action and pass a reason
          catchError(() => of(loadEngineAction(color))),
        ),
        from(
          delayEmit(
            instance.engine.workflow,
            EngineWorkflow.uciAction(),
            EngineWorkflow.debugAction(true),
          ),
        ),
      ),
  ];
}

function handleMovePiece(
  state: State,
  action: Action & { type: Type.MovePiece },
  { core }: Context,
): Update<State, Action> {
  if (gameIsOver(state)) {
    return [state, null];
  }

  const { move } = action;
  const legalMoves = state.game.moves;

  if (!movesIncludes(legalMoves, move)) {
    logger.warn('illegal move:', moveString(move));
    return [{ ...state, selectedSquare: null }, overlaySquaresAction];
  }

  const pieceToMove = pieceInSquare(state, move.from);
  if (!pieceToMove) {
    throw Error('there should be a piece to move');
  }

  // Check if the move is a promotion. Since there is no UI we need to auto-promote
  // as queen for human players.
  if (
    pieceToMove.type === PieceType.Pawn &&
    isPromotionPositionPawn(pieceToMove.color, move.from) &&
    !move.promotion
  ) {
    move.promotion = PieceType.Queen;
  }

  const captured = core.applyMove(move);
  if (captured) {
    play(Sound.Capture);
  } else {
    play(Sound.Move);
  }

  return [
    {
      ...state,
      game: {
        ...state.game,
        turn: flipColor(state.game.turn),
        clocks: {
          ...state.game.clocks,
          [state.game.turn]:
            state.game.clocks[state.game.turn] +
            state.game.clocks.plusTime * 1000,
        },
        moveIndex: state.game.moveList.length + 1,
        moveList: [...state.game.moveList, move],
      },
      lastMove: move,
    },
    () => of(setPositionAction(core.position), attemptEngineMoveAction()),
  ];
}

function handleNavigatePosition(
  state: State,
  action: Action & { type: Type.NavigatePosition },
  { core }: Context,
): Update<State, Action> {
  let { moveList, moveIndex } = state.game;

  switch (action.to) {
    case Navigate.Back:
      moveIndex -= 1;
      break;
    case Navigate.Forward:
      moveIndex += 1;
      break;
    case Navigate.Start:
      moveIndex = 0;
      break;
    case Navigate.Current:
      moveIndex = moveList.length;
      break;
  }

  if (
    moveIndex < 0 ||
    moveIndex > moveList.length ||
    moveIndex === state.game.moveIndex
  ) {
    return [state, null];
  }

  core.position = parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN);
  moveList = moveList.slice(0, moveIndex);
  for (const move of moveList) {
    core.applyMove(move);
  }
  play(Sound.Move);

  return [
    {
      ...state,
      selectedSquare: null,
      game: { ...state.game, moveIndex },
      lastMove: moveList[moveList.length - 1],
    },
    () => setPositionAction(core.position),
  ];
}

function handleOverlaySquares(
  state: State,
  context: Context,
): Update<State, Action> {
  const squareOverlay: Record<Square, SquareOverlayType> = {};
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

function handleReceiveEngineMove(
  state: State,
  action: Action & { type: Type.ReceiveEngineMove },
): Update<State, Action> {
  const { move } = action;

  if (!isDisplayingCurrentPosition(state)) {
    return [
      state,
      () => of(navigatePositionAction(Navigate.Current), movePieceAction(move)),
    ];
  } else {
    return [state, () => movePieceAction(move)];
  }
}

function handleResetOverlay(state: State): Update<State, Action> {
  return [{ ...state, squareOverlay: {} }, null];
}

function handleSetPosition(
  state: State,
  action: Action & { type: Type.SetPosition },
  { core }: Context,
): Update<State, Action> {
  const { position } = action;

  if (!isPositionEqual(position, core.position)) {
    logger.error('position desync', core.position, position);
  }

  const moves = core.generateMoves();
  const evaluation = core.evaluate() / EVALUATION_DIVIDER;
  const checks = core.checks(position.turn);

  state = {
    ...state,
    game: { ...state.game, position, moves, evaluation, checks },
  };

  if (position.halfMoveCount === 100) {
    play(Sound.Draw);
    return [
      {
        ...state,
        game: { ...state.game, winner: Draw },
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
        game: { ...state.game, winner },
      },
      overlaySquaresAction,
    ];
  }

  if (checks.length > 0) {
    play(Sound.Check);
  }

  return [state, overlaySquaresAction];
}

function handleSetPositionFromFEN(
  state: State,
  action: Action & { type: Type.SetPositionFromFEN },
  { core }: Context,
): Update<State, Action> {
  const position = parseFEN(action.fenString);
  core.position = position;
  const isStartPos = action.fenString === FEN_LIBRARY.STARTING_POSITION_FEN;

  return [
    {
      ...state,
      game: {
        ...state.game,
        winner: null,
        turn: position.turn,
        startFen: isStartPos ? 'startpos' : action.fenString,
      },
    },
    () => setPositionAction(position),
  ];
}

function handleTickPlayersClock(state: State): Update<State, Action> {
  const { position, clocks } = state.game;
  const tick = Date.now();

  const turnClock = clocks[position.turn];

  state = {
    ...state,
    game: {
      ...state.game,
      clocks: {
        ...clocks,
        lastTick: tick,
        [position.turn]:
          turnClock > 0
            ? Math.max(turnClock - (tick - clocks.lastTick), 0)
            : state.game.clocks[position.turn],
      },
    },
  };

  if (state.game.clocks[position.turn] <= 0) {
    state = {
      ...state,
      game: { ...state.game, winner: flipColor(position.turn) },
    };
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
      case Type.AttemptEngineMove:
        return handleAttemptEngineMove(state);
      case Type.ChangeOverlay:
        return handleChangeOverlay(state);
      case Type.LoadEngineDone:
        return handleLoadEngineDone(state, action);
      case Type.ClickSquare:
        return handleClickSquare(state, action);
      case Type.EngineResponse:
        return handleEngineResponse(state, action);
      case Type.FlipBoard:
        return handleFlipBoard(state);
      case Type.LoadEngine:
        return handleLoadEngine(state, action, context);
      case Type.MovePiece:
        return handleMovePiece(state, action, context);
      case Type.NavigatePosition:
        return handleNavigatePosition(state, action, context);
      case Type.OverlaySquares:
        return handleOverlaySquares(state, context);
      case Type.ReceiveEngineMove:
        return handleReceiveEngineMove(state, action);
      case Type.ResetOverlay:
        return handleResetOverlay(state);
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
