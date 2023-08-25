import { expect, test } from 'vitest';
import Engine from '.';
import { parseFEN, FEN_LIBRARY } from '../lib/fen';

test('pawn capture pawn position', () => {
  const position = parseFEN(
    'rnbqkbnr/p1pppppp/8/8/4PN2/1p6/PPPP1PPP/R1BQKBNR b KQkq - 1 4',
  );
  const engine = new Engine(position);
  const move = { from: 17, to: 8 };

  engine.applyMove(move);
});
