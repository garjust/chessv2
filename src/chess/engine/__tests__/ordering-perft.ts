import Engine from '..';
import { parseFEN, PERFT_5_FEN } from '../../lib/fen';
import { Move, MoveWithExtraData } from '../../types';
import { orderMoves } from '../move-ordering';

const N = 100_000;

test('perft of move ordering', () => {
  const position = parseFEN(PERFT_5_FEN);
  const engine = new Engine(position);
  const moves = engine.generateMovementData().moves;

  const start = Date.now();
  for (let i = 0; i < N; i++) {
    orderMoves([...moves]);
  }
  const timing = Date.now() - start;

  console.log(`timing=${timing}`);
});
