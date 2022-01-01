import { ComputedMovementData, Move, MoveWithExtraData } from '../types';
import { PieceValue } from './evaluation';
import { HEATMAPS } from '../lib/heatmaps';

// Descending sort.
const SORT_FN = (
  { weight: a }: { weight: number },
  { weight: b }: { weight: number }
) => b - a;

const moveWeight = (move: MoveWithExtraData): number => {
  let n = 0;

  // const heatmapFrom = HEATMAPS[move.piece.type][move.piece.color][move.from];
  const heatmapTo = HEATMAPS[move.piece.type][move.piece.color][move.to];

  n += heatmapTo;

  if (move.attack) {
    n += Math.max(
      5,
      10 *
        (PieceValue[move.attack.attacked.type] -
          PieceValue[move.attack.attacker.type])
    );
  }
  if (move.promotion) {
    n += 50;
  }

  return n;
};

export const orderMoves = (moveData: ComputedMovementData): Move[] => {
  return moveData.moves
    .map((move) => ({ move, weight: moveWeight(move) }))
    .sort(SORT_FN)
    .map(({ move }) => move);
};
