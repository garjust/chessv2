import Engine from '..';
import { VIENNA_GAMBIT_ACCEPTED_GAME } from '../../lib/example-games';
import { parseFEN, FEN_LIBRARY } from '../../lib/fen';
import { moveFromString } from '../../utils';

test('vienna accepted game', () => {
  const engine = new Engine(parseFEN(FEN_LIBRARY.STARTING_POSITION_FEN));
  const moves = VIENNA_GAMBIT_ACCEPTED_GAME.map(moveFromString);
  const initialZobrist = engine.zobrist;

  for (const move of moves) {
    engine.applyMove(move);
  }

  for (let i = 0; i < moves.length; i++) {
    engine.undoLastMove();
  }

  expect(engine.zobrist).toEqual(initialZobrist);
});
