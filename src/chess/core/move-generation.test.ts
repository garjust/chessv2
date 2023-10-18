import { expect, test } from 'vitest';
import Core from '.';
import { parseFEN, FEN_LIBRARY } from '../lib/fen';

test('move generation perft_5', () => {
  const engine = new Core(parseFEN(FEN_LIBRARY.PERFT_5_FEN));

  const moves = engine.generateMoves();
  expect(moves.length).toEqual(44);
});

test('move generation bongcloud 1', () => {
  const engine = new Core(
    parseFEN('rnbqkbnr/1ppppppp/8/p7/3P4/8/PPP1PPPP/RNBQKBNR w KQkq a6 0 2'),
  );

  const moves = engine.generateMoves();
  expect(moves.length).toEqual(28);
});

test('move generation queen checking must be captured', () => {
  const engine = new Core(
    parseFEN(
      'rnbq1b1r/1pppkppp/4Qn2/p3p3/2B1P3/2N5/PPPP1PPP/R1B1K1NR b KQ - 3 5',
    ),
  );

  const moves = engine.generateMoves();
  expect(moves.length).toEqual(2);
});
