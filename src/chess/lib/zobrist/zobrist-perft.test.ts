import { expect, test } from 'vitest';
import { parseFEN, FEN_LIBRARY } from '../fen';

import { makeNumbers as makeNumbers32 } from './numbers-32bit';
import { makeNumbers as makeNumbers64 } from './numbers-64bit';
import { StatefulHash, StatefulHash64 } from './stateful-hash';

const N = 1_000_000;

test('32bit zobrist updating', () => {
  const position = parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN);
  const zobrist = new StatefulHash(position, makeNumbers32());

  const start = Date.now();
  for (let n = 0; n < N; n++) {
    zobrist.updateTurn();
  }
  const timing = Date.now() - start;

  console.log(`zobrist 32: ${(timing * 1000) / N}μs/op`);
});

test('64bit zobrist updating', () => {
  const position = parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN);
  const zobrist = new StatefulHash64(position, makeNumbers64());

  const start = Date.now();
  for (let n = 0; n < N; n++) {
    zobrist.updateTurn();
  }
  const timing = Date.now() - start;

  console.log(`zobrist 64: ${(timing * 1000) / N}μs/op`);
});
