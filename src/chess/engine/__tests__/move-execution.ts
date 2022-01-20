import Engine from '..';
import { VIENNA_GAMBIT_ACCEPTED_GAME } from '../../lib/example-games';
import { formatPosition, parseFEN, STARTING_POSITION_FEN } from '../../lib/fen';
import { Move } from '../../types';
import { moveFromString } from '../../utils';

const N = 1000;
const MOVES: Move[] = VIENNA_GAMBIT_ACCEPTED_GAME.map(moveFromString);

test('move execution perft', () => {
  const engine = new Engine(parseFEN(STARTING_POSITION_FEN));
  const moves = MOVES;

  const now = Date.now();
  for (let n = 0; n < N; n++) {
    for (const move of moves) {
      engine.applyMove(move);
    }
    for (let i = 0; i < moves.length; i++) {
      engine.undoLastMove();
    }
  }

  const time = Date.now() - now;
  console.log(
    `move execution timing: ${time}ms (${((time / N) * 1000).toPrecision(
      5
    )}μs/move-unmove)`
  );

  expect(formatPosition(engine.position)).toEqual(STARTING_POSITION_FEN);
});
