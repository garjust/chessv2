import { expect, test, vi } from 'vitest';
import {
  uciAction,
  isReadyAction,
  uciNewGameAction,
  positionAction,
  goAction,
} from './workflow';
import { UCIResponse, UCIResponseType } from './workflow/uci-response';
import { Engine } from './engine';
import { FEN_LIBRARY } from '../lib/fen';
import { Command } from '../../lib/workflow/commands';
import { Color, PieceType } from '../types';

test('example interaction with UCI engine', async () => {
  let responses: UCIResponse[] = [];

  const engine = new Engine('Iterative', 3);
  engine.responses.subscribe((r) => {
    responses = [...responses, r];
  });

  engine.emit(uciAction());
  expect(responses).toEqual([
    {
      type: UCIResponseType.Id,
      name: 'justin uci computer v1',
      author: 'garjust',
    },
    { type: UCIResponseType.Option, name: 'Hash' },
    { type: UCIResponseType.Option, name: 'OwnBook' },
    { type: UCIResponseType.UCIOk },
  ]);
  responses = [];

  // engine.emit(setOptionAction('Hash', '512'));
  // engine.emit(setOptionAction('OwnBook', 'false'));
  engine.emit(isReadyAction());
  await vi.waitUntil(() => responses.length !== 0);
  expect(responses).toEqual([{ type: UCIResponseType.ReadyOk }]);
  responses = [];

  engine.emit(uciNewGameAction());
  engine.emit(positionAction(FEN_LIBRARY.STARTING_POSITION_FEN));
  engine.emit(goAction());
  await vi.waitUntil(() => responses.length !== 0);
  expect(responses).toEqual([
    {
      type: UCIResponseType.BestMove,
      move: {
        from: 11,
        piece: {
          color: Color.White,
          type: PieceType.Pawn,
        },
        to: 27,
        weight: 9007199254740991,
      },
    },
  ]);
  responses = [];

  engine.workflow.emit(Command.Done);
});
