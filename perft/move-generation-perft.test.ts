import { expect, test } from 'vitest';
import Core from '../src/chess/core';
import { parseFEN, FEN_LIBRARY } from '../src/chess/lib/fen';
import { TestFens, searchRoot } from '../src/chess/lib/perft';

test('perft_5', () => {
  const engine = new Core(parseFEN(FEN_LIBRARY.PERFT_5_FEN));

  const start = Date.now();
  const { counter } = searchRoot(engine, 5);
  const timing = Date.now() - start;

  expect(counter).toEqual(TestFens.PERFT_POSITION_5.counts[4]);
  console.log(
    `perft_5 position: ${((timing / counter) * 1000).toPrecision(5)}μs/node`,
  );
});

test('starting position', () => {
  const engine = new Core(parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN));

  const start = Date.now();
  const { counter } = searchRoot(engine, 5);
  const timing = Date.now() - start;

  expect(counter).toEqual(TestFens.STARTING_POSITION.counts[4]);
  console.log(
    `starting position: ${((timing / counter) * 1000).toPrecision(5)}μs/node`,
  );
});

test('vienna opening', () => {
  const engine = new Core(parseFEN(FEN_LIBRARY.VIENNA_OPENING_FEN));

  const start = Date.now();
  const { counter } = searchRoot(engine, 5);
  const timing = Date.now() - start;

  expect(counter).toEqual(TestFens.VIENNA_OPENING.counts[4]);
  console.log(
    `vienna opening position: ${((timing / counter) * 1000).toPrecision(
      5,
    )}μs/node`,
  );
});
