import { from } from 'rxjs';
import { Update } from '../../../lib/workflow';
import Engine from '../../engine';
import { parseFEN } from '../fen';
import { UCICommandAction, respondAction } from './action';
import { State, Action, Type } from './index';
import { toUCIString, UCIResponse, UCIResponseType } from './uci-response';
import { ChessComputer } from '../../ai/chess-computer';
import { moveFromString } from '../../move-notation';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Context = {
  ai: ChessComputer;
  engine: Engine;
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

function handleDebug(
  state: State,
  action: Action.UCICommand.Debug,
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
  action: Action.UCICommand.Go,
  context: Context,
): Update<State, Action> {
  // Call engine to do stuff.
  const nextMove = context.ai.nextMove(context.engine.position, 500);
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
  action: Action.Internal.Respond,
  context: Context,
): Update<State, Action> {
  context.sendUCIResponse(action.response);
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
