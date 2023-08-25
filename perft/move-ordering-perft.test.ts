import { expect, test } from 'vitest';
import Engine from '../src/chess/engine';
import { parseFEN, FEN_LIBRARY } from '../src/chess/lib/fen';
import { orderMoves } from '../src/chess/ai/search/move-ordering';

const N = 100_000;

test('perft of move ordering', () => {
  const position = parseFEN(FEN_LIBRARY.PERFT_5_FEN);
  const engine = new Engine(position);
  const moves = engine.generateMoves();

  const start = Date.now();
  for (let i = 0; i < N; i++) {
    orderMoves([...moves]);
  }
  const timing = Date.now() - start;

  console.log(`timing=${timing}`);
});
