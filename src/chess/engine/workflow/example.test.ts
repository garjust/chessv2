import { expect, test } from 'vitest';
import init, {
  createState,
  uciAction,
  isReadyAction,
  setOptionAction,
  uciNewGameAction,
} from '.';
import Core from '../../core';
import Iterative from '../algorithms/iterative';
import { UCIResponse, toUCI } from './uci-response';

test('example interaction with UCI engine worker', () => {
  let responses: UCIResponse[] = [];

  const { emit } = init(createState(), {
    engine: new Core(),
    executor: new Iterative(4),
    sendUCIResponse: (response) => responses.push(response),
  });

  emit(uciAction());

  expect(toUCI(...responses)).toEqual([
    'id name justin uci computer v1',
    'id author garjust',
    'option name Hash type spin default 128 min 128 max 1024',
    'option name OwnBook type check default true',
    'uciok',
  ]);
  responses = [];

  emit(setOptionAction('Hash', '512'));
  emit(setOptionAction('OwnBook', 'false'));
  emit(isReadyAction());

  expect(responses).toEqual(['readyok']);

  emit(uciNewGameAction());
});
