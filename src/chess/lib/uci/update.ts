import { from } from 'rxjs';
import { Update } from '../../../lib/workflow';
import Engine from '../../engine';
import { moveFromString } from '../../utils';
import { parseFEN } from '../fen';
import { respondAction } from './action';
import { State, Action, Type } from './index';
import { toUCIString, UCIResponse, UCIResponseType } from './uci-response';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {
  engine: Engine;
  sendUCIResponse: (response: string) => void;
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
    { type: UCIResponseType.Option },
    { type: UCIResponseType.Option },
    { type: UCIResponseType.UCIOk },
  ];

  return [state, respondWith(...responses)];
}

function handleDebug(
  state: State,
  action: Action.UCICommand.Debug
): Update<State, Action> {
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
  action: Action.UCICommand.Position,
  context: Context
): Update<State, Action> {
  const { fen, moves } = action;

  context.engine.position = parseFEN(fen);
  for (const moveString of moves) {
    const move = moveFromString(moveString);
    context.engine.applyMove(move);
  }

  return [state, null];
}

function handleGo(
  state: State,
  action: Action.UCICommand.Go,
  context: Context
): Update<State, Action> {
  // Call engine to do stuff.

  return [state, null];
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
  action: Action.Internal.Respond,
  context: Context
): Update<State, Action> {
  toUCIString(action.response).map(context.sendUCIResponse);

  return [state, null];
}

export const update =
  (context: Context) =>
  (state: State, action: Action): Update<State, Action> => {
    switch (action.type) {
      case Type.UCICommand.UCI:
        return handleUCI(state);
      case Type.UCICommand.Debug:
        return handleDebug(state, action);
      case Type.UCICommand.IsReady:
        return handleIsReady(state);
      case Type.UCICommand.SetOption:
        return handleSetOption(state);
      case Type.UCICommand.Register:
        return handleRegister(state);
      case Type.UCICommand.UCINewGame:
        return handleUCINewGame(state);
      case Type.UCICommand.Position:
        return handlePosition(state, action, context);
      case Type.UCICommand.Go:
        return handleGo(state, action, context);
      case Type.UCICommand.Stop:
        return handleStop(state, context);
      case Type.UCICommand.PonderHit:
        return handlePonderHit(state);
      case Type.UCICommand.Quit:
        return handleQuit(state);
      case Type.Internal.Respond:
        return handleRespond(state, action, context);
    }
  };
