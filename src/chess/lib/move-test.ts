import { Position } from '../types';
import { flattenMoves } from '../utils';
import { applyMove } from './move-execution';
import { computeMovementData } from './move-generation';

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
