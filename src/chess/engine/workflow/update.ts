import { Subject, concat, from, map, of } from 'rxjs';
import { Update } from '../../../lib/workflow';
import Core from '../../core';
import { parseFEN } from '../../lib/fen';
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
import { Info, UCIResponse, UCIResponseType } from './uci-response';
import { loadSearchExecutorWorker } from '../../workers';
import { Command } from '../../../lib/workflow/commands';
import { executorInstance } from './state';
import { proxy } from 'comlink';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {
  core: Core;
};

const respondWith = (...responses: UCIResponse[]) =>
  from(responses.map(respondAction));

function handleUCI(state: State): Update<State, Action> {
  const responses: UCIResponse[] = [
    {
      type: UCIResponseType.Id,
      name: `garb uci engine ${state.config.version}`,
      author: 'garjust',
    },
    { type: UCIResponseType.Option, name: 'Hash' },
    { type: UCIResponseType.Option, name: 'OwnBook' },
    { type: UCIResponseType.UCIOk },
  ];

  return [state, () => respondWith(...responses)];
}

function handleDebug(state: State, action: DebugAction): Update<State, Action> {
  return [{ ...state, debug: action.value }, null];
}

function handleIsReady(state: State): Update<State, Action> {
  if (state.executorInstance !== null) {
    return [state, () => respondWith({ type: UCIResponseType.ReadyOk })];
  }

  return [state, () => loadSearchExecutorAction(state.config.version)];
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
  context.core.position = position;
  for (const move of moves) {
    context.core.applyMove(move);
  }

  return [{ ...state, positionForGo: context.core.position }, null];
}

function handleGo(
  state: State,
  action: GoAction,
  context: Context,
): Update<State, Action> {
  const { executorInstance } = state;
  const go = action.command;
  if (executorInstance === null) {
    throw new Error('search executor instance has not been initialized');
  }

  // TODO: determine timeout based on go command time control info
  const timeout = 5000;

  const nextMove = executorInstance.executor.nextMove(
    context.core.position,
    go.searchmoves ?? [],
    go.infinite ? Number.MAX_SAFE_INTEGER : timeout,
    { depth: go.depth, nodes: go.nodes, time: go.movetime },
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
  // TODO: call engine to stop the search as soon as possible.
  return [state, null];
}

function handlePonderHit(state: State): Update<State, Action> {
  return [state, null];
}

function handleQuit(state: State): Update<State, Action> {
  state.executorInstance?.cleanup();
  return [state, () => Command.Done];
}

function handleRespond(state: State, _: RespondAction): Update<State, Action> {
  // No-op action used for communicating externally.
  return [state, null];
}

function handleLoadSearchExecutor(
  state: State,
  action: LoadSearchExecutorAction,
): Update<State, Action> {
  const infoFromExecutor$ = new Subject<Info>();

  return [
    state,
    () =>
      loadSearchExecutorWorker(
        action.version,
        proxy((info: Info) => {
          infoFromExecutor$.next(info);
        }),
      ).then(([executor, cleanup]) =>
        loadSearchExecutorDoneAction(
          executorInstance(executor, () => {
            cleanup();
            infoFromExecutor$.complete();
          }),
          infoFromExecutor$.asObservable(),
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
    () =>
      concat(
        respondWith({ type: UCIResponseType.ReadyOk }),
        action.infoFromExecutor$.pipe(
          map(
            (info) =>
              ({
                type: UCIResponseType.Info,
                info,
              }) as UCIResponse,
          ),
          map(respondAction),
        ),
      ),
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
