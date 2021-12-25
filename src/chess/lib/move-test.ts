import { Position } from '../types';
import { PERFT_5_FEN, STARTING_POSITION_FEN } from './fen';
import engine from '../engines/default';
import { computeMovementData } from '../engines/default/move-generation';

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

export const run = async (
  position: Position,
  depth: number
): Promise<number> => {
  if (depth === 0) {
    return 1;
  }

  let n = 0;

  const movementData = computeMovementData(position);
  for (const move of movementData.moves) {
    const result = engine.applyMove(position, move);
    n += await run(result.position, depth - 1);
  }

  return n;
};
