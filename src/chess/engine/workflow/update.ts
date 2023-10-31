import { from } from 'rxjs';
import { Update } from '../../../lib/workflow';
import Core from '../../core';
import { FEN_LIBRARY, parseFEN } from '../../lib/fen';
import {
  Type,
  Action,
  DebugAction,
  GoAction,
  InternalType,
  PositionAction,
  RespondAction,
  respondAction,
  LoadSearchExecutorAction,
  LoadSearchExecutorDoneAction,
  loadSearchExecutorDoneAction,
  loadSearchExecutorAction,
  SetOptionAction,
} from './action';
import { State } from './index';
import { UCIResponse, UCIResponseType } from './uci-response';
import { moveFromString } from '../../move-notation';
import { loadSearchExecutorWorker } from '../../workers';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {
  engine: Core;
};

const respondWith =
  (...responses: UCIResponse[]) =>
  () =>
    from(responses.map(respondAction));

function handleUCI(state: State): Update<State, Action> {
  const responses: UCIResponse[] = [
    {
      type: UCIResponseType.Id,
      name: 'justin uci computer v1',
      author: 'garjust',
    },
    { type: UCIResponseType.Option, name: 'Hash' },
    { type: UCIResponseType.Option, name: 'OwnBook' },
    { type: UCIResponseType.UCIOk },
  ];

  return [state, respondWith(...responses)];
}

function handleDebug(state: State, action: DebugAction): Update<State, Action> {
  return [{ ...state, debug: action.value }, null];
}

function handleIsReady(state: State): Update<State, Action> {
  if (state.executorInstance !== null) {
    return [state, respondWith({ type: UCIResponseType.ReadyOk })];
  }

  return [
    state,
    () => loadSearchExecutorAction(state.config.version, state.config.maxDepth),
  ];
}

function handleSetOption(
  state: State,
  action: SetOptionAction,
): Update<State, Action> {
  switch (action.option.name) {
    case 'Hash':
      return [
        {
          ...state,
          options: { ...state.options, hashSize: action.option.value },
        },
        null,
      ];
    case 'OwnBook':
      return [
        {
          ...state,
          options: { ...state.options, useBookMoves: action.option.value },
        },
        null,
      ];
  }
}

function handleRegister(state: State): Update<State, Action> {
  return [state, null];
}

function handleUCINewGame(state: State): Update<State, Action> {
  return [state, null];
}

function handlePosition(
  state: State,
  action: PositionAction,
  context: Context,
): Update<State, Action> {
  const { fen, moves } = action;

  const position = parseFEN(fen);
  context.engine.position = position;
  for (const moveString of moves) {
    const move = moveFromString(moveString);
    context.engine.applyMove(move);
  }

  return [{ ...state, positionForGo: context.engine.position }, null];
}

function handleGo(
  state: State,
  action: GoAction,
  context: Context,
): Update<State, Action> {
  const { executorInstance } = state;
  if (executorInstance === null) {
    throw new Error('search executor instance has not been initialized');
  }

  const nextMove = executorInstance.executor.nextMove(
    context.engine.position,
    500,
  );

  return [
    state,
    () =>
      from(
        nextMove.then((move) =>
          respondAction({ type: UCIResponseType.BestMove, move }),
        ),
      ),
  ];
}

function handleStop(state: State, context: Context): Update<State, Action> {
  // TODO: call engine to stop the search.
  return [state, null];
}

function handlePonderHit(state: State): Update<State, Action> {
  return [state, null];
}

function handleQuit(state: State): Update<State, Action> {
  throw Error('quit I guess');
}

function handleRespond(state: State, _: RespondAction): Update<State, Action> {
  // No-op action used for communicating externally.
  return [state, null];
}

function handleLoadSearchExecutor(
  state: State,
  action: LoadSearchExecutorAction,
): Update<State, Action> {
  return [
    state,
    () =>
      from(
        loadSearchExecutorWorker(action.version, 10).then(
          ([executor, cleanup]) =>
            loadSearchExecutorDoneAction({
              executor,
              cleanup,
              __computer: true,
            }),
        ),
      ),
  ];
}

function handleLoadSearchExecutorDone(
  state: State,
  action: LoadSearchExecutorDoneAction,
): Update<State, Action> {
  return [
    { ...state, executorInstance: action.instance },
    respondWith({ type: UCIResponseType.ReadyOk }),
  ];
}

export const update =
  (context: Context) =>
  (state: State, action: Action): Update<State, Action> => {
    switch (action.type) {
      case Type.UCI:
        return handleUCI(state);
      case Type.Debug:
        return handleDebug(state, action);
      case Type.IsReady:
        return handleIsReady(state);
      case Type.SetOption:
        return handleSetOption(state, action);
      case Type.Register:
        return handleRegister(state);
      case Type.UCINewGame:
        return handleUCINewGame(state);
      case Type.Position:
        return handlePosition(state, action, context);
      case Type.Go:
        return handleGo(state, action, context);
      case Type.Stop:
        return handleStop(state, context);
      case Type.PonderHit:
        return handlePonderHit(state);
      case Type.Quit:
        return handleQuit(state);
      case InternalType.Respond:
        return handleRespond(state, action);
      case InternalType.LoadSearchExecutor:
        return handleLoadSearchExecutor(state, action);
      case InternalType.LoadSearchExecutorDone:
        return handleLoadSearchExecutorDone(state, action);
    }
  };
