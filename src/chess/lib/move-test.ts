import { Position } from '../types';
import { flattenMoves } from '../utils';
import { STARTING_POSITION_FEN } from './fen';
import { applyMove } from './move-execution';
import { computeMovementData } from './move-generation';

export type MoveTest = {
  fen: string;
  counts: number[];
};

export const PERFT_POSITION_5: MoveTest = {
  fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8 ',
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

export const countMoves = (position: Position, depth: number): number => {
  if (depth === 0) {
    return 1;
  }

  let n = 0;

  const movementData = computeMovementData(position);
  for (const move of flattenMoves(movementData.movesByPiece)) {
    const result = applyMove(position, move);
    n += countMoves(result.position, depth - 1);
  }

  return n;
};
