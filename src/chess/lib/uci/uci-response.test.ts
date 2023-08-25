import { expect, test } from 'vitest';
import { toUCIString, UCIResponseType } from './uci-response';

test('responses', () => {
  expect(toUCIString({ type: UCIResponseType.UCIOk })).toEqual(['uciok']);
  expect(toUCIString({ type: UCIResponseType.ReadyOk })).toEqual(['readyok']);
  expect(
    toUCIString({
      type: UCIResponseType.Id,
      name: 'justin uci computer v1',
      author: 'garjust',
    }),
  ).toEqual(['id name justin uci computer v1', 'id author garjust']);
  expect(toUCIString({ type: UCIResponseType.Option, name: 'Hash' })).toEqual([
    'option name Hash type spin default 128 min 128 max 1024',
  ]);
  expect(
    toUCIString({ type: UCIResponseType.Option, name: 'OwnBook' }),
  ).toEqual(['option name OwnBook type check default true']);
});
