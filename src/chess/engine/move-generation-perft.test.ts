import { expect, test } from 'vitest';
import Engine from '.';
import { parseFEN, FEN_LIBRARY } from '../lib/fen';
import {
  PERFT_POSITION_5,
  searchRoot,
  STARTING_POSITION,
  VIENNA_OPENING,
} from '../lib/perft';

test('perft_5', () => {
  const engine = new Engine(parseFEN(FEN_LIBRARY.PERFT_5_FEN));

  const start = Date.now();
  const { counter } = searchRoot(engine, 5);
  const timing = Date.now() - start;

  expect(counter).toEqual(PERFT_POSITION_5.counts[4]);
  console.log(
    `perft_5 position: ${((timing / counter) * 1000).toPrecision(5)}μs/node`,
  );
});

test('starting position', () => {
  const engine = new Engine(parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN));

  const start = Date.now();
  const { counter } = searchRoot(engine, 5);
  const timing = Date.now() - start;

  expect(counter).toEqual(STARTING_POSITION.counts[4]);
  console.log(
    `starting position: ${((timing / counter) * 1000).toPrecision(5)}μs/node`,
  );
});

test('vienna opening', () => {
  const engine = new Engine(parseFEN(FEN_LIBRARY.VIENNA_OPENING_FEN));

  const start = Date.now();
  const { counter } = searchRoot(engine, 5);
  const timing = Date.now() - start;

  expect(counter).toEqual(VIENNA_OPENING.counts[4]);
  console.log(
    `vienna opening position: ${((timing / counter) * 1000).toPrecision(
      5,
    )}μs/node`,
  );
});
