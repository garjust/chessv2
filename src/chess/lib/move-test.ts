import { PERFT_5_FEN, STARTING_POSITION_FEN } from './fen';
import Engine from '../engine';

export type MoveTest = {
  fen: string;
  counts: number[];
};

export const PERFT_POSITION_5: MoveTest = {
  fen: PERFT_5_FEN,
  counts: [44, 1486, 62379, 2103487, 89941194],
};

export const STARTING_POSITION: MoveTest = {
  fen: STARTING_POSITION_FEN,
  counts: [20, 400, 8902, 197281, 4865609, 119060324],
};

export const isCountCorrectForDepthFromStart = (
  depth: number,
  count: number,
  test: MoveTest
) => {
  return test.counts[depth - 1] === count;
};

export const run = async (engine: Engine, depth: number): Promise<number> => {
  if (depth === 0) {
    return 1;
  }

  let n = 0;

  const movementData = engine.generateMovementData();
  for (const move of movementData.moves) {
    engine.applyMove(move);
    n += await run(engine, depth - 1);
    engine.undoLastMove();
  }

  return n;
};
