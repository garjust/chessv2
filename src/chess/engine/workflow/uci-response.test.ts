import { expect, test } from 'vitest';
import { toUCI, UCIResponseType } from './uci-response';

test('responses', () => {
  expect(toUCI({ type: UCIResponseType.UCIOk })).toEqual(['uciok']);
  expect(toUCI({ type: UCIResponseType.ReadyOk })).toEqual(['readyok']);
  expect(
    toUCI({
      type: UCIResponseType.Id,
      name: 'justin uci computer v1',
      author: 'garjust',
    }),
  ).toEqual(['id name justin uci computer v1', 'id author garjust']);
  expect(toUCI({ type: UCIResponseType.Option, name: 'Hash' })).toEqual([
    'option name Hash type spin default 128 min 128 max 1024',
  ]);
  expect(toUCI({ type: UCIResponseType.Option, name: 'OwnBook' })).toEqual([
    'option name OwnBook type check default true',
  ]);
});
