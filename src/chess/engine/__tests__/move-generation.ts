import Engine from '..';
import { parseFEN, FEN_LIBRARY } from '../../lib/fen';

test('move generation perft_5', () => {
  const engine = new Engine(parseFEN(FEN_LIBRARY.PERFT_5_FEN));

  const moves = engine.generateMoves();
  expect(moves.length).toEqual(44);
});

test('move generation bongcloud 1', () => {
  const engine = new Engine(
    parseFEN('rnbqkbnr/1ppppppp/8/p7/3P4/8/PPP1PPPP/RNBQKBNR w KQkq a6 0 2')
  );

  const moves = engine.generateMoves();
  expect(moves.length).toEqual(28);
});
