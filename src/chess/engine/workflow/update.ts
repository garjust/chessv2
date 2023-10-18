import { from } from 'rxjs';
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
} from './action';
import { State } from './index';
import { UCIResponse, UCIResponseType } from './uci-response';
import { SearchExecutorI } from '../search-executor';
import { moveFromString } from '../../move-notation';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {
  executor: SearchExecutorI;
  engine: Core;
  sendUCIResponse: (response: UCIResponse) => void;
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
  return [state, respondWith({ type: UCIResponseType.ReadyOk })];
}

function handleSetOption(state: State): Update<State, Action> {
  return [state, null];
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
  // Call engine to do stuff.
  const nextMove = context.executor.nextMove(context.engine.position, 500);
  nextMove.then();

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

function handleRespond(
  state: State,
  action: RespondAction,
  context: Context,
): Update<State, Action> {
  context.sendUCIResponse(action.response);
  return [state, null];
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
        return handleSetOption(state);
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
        return handleRespond(state, action, context);
    }
  };
