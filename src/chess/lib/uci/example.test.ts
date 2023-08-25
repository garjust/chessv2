import { expect, test } from 'vitest';
import init, { createState, Action } from '.';
import Engine from '../../engine';
import { UCICommandAction } from './action';
import Iterative from '../../ai/algorithms/iterative';

test('example interaction with engine in UCI', () => {
  let responses: string[] = [];

  const { emit } = init(createState(), {
    engine: new Engine(),
    ai: new Iterative(4),
    sendUCIResponse: (response: string) => responses.push(response),
  });

  emit(UCICommandAction.uciAction());

  expect(responses).toEqual([
    'id name justin uci computer v1',
    'id author garjust',
    'option name Hash type spin default 128 min 128 max 1024',
    'option name OwnBook type check default true',
    'uciok',
  ]);
  responses = [];

  emit(UCICommandAction.setOptionAction('Hash', '512'));
  emit(UCICommandAction.setOptionAction('OwnBook', 'false'));
  emit(UCICommandAction.isReadyAction());

  expect(responses).toEqual(['readyok']);

  emit(UCICommandAction.uciNewGameAction());
});
