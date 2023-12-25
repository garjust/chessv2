import { expect, test } from 'vitest';
import { parse } from './parse-cli-command';
import { Public, Type } from './action';

test('parse', () => {
  expect(parse('uci')).toEqual<Public>({
    type: Type.UCI,
  });

  expect(parse('position startpos')).toEqual<Public>({
    type: Type.Position,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
  });
  expect(parse('position startpos moves e2e4 e7e5')).toEqual<Public>({
    type: Type.Position,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [
      { from: 12, to: 28 },
      { from: 52, to: 36 },
    ],
  });

  expect(parse('go depth 5 movetime 500 nodes 11111')).toEqual<Public>({
    type: Type.Go,
    command: {
      depth: 5,
      movetime: 500,
      nodes: 11111,
    },
  });
  expect(parse('go')).toEqual<Public>({
    type: Type.Go,
    command: {},
  });
});
