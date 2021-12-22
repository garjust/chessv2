import { Position } from '../types';
import { flattenMoves } from '../utils';
import { applyMove } from './move-execution';
import { computeMovementData } from './move-generation';

const CORRECT_COUNTS_BY_DEPTH_FROM_START = [
  20, 400, 8902, 197281, 4865609, 119060324,
];

export const isCountCorrectForDepthFromStart = (
  depth: number,
  count: number
) => {
  return CORRECT_COUNTS_BY_DEPTH_FROM_START[depth - 1] === count;
};

export const countMoves = (position: Position, depth: number): number => {
  if (depth === 0) {
    return 1;
  }

  let n = 0;

  const movementData = computeMovementData(position);
  flattenMoves(movementData.movesByPiece).forEach((move) => {
    const result = applyMove(position, move);
    n += countMoves(result.position, depth - 1);
  });

  return n;
};
