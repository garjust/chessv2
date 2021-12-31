import { ComputedMovementData, Move, MoveWithExtraData } from '../types';

// Descending sort.
const SORT_FN = (
  { weight: a }: { weight: number },
  { weight: b }: { weight: number }
) => b - a;

const moveWeight = (move: MoveWithExtraData): number => {
  let n = 0;

  if (move.attack) {
    n += 1;
  }
  if (move.promotion) {
    n += 10;
  }

  return n;
};

export const orderMoves = (moveData: ComputedMovementData): Move[] => {
  return moveData.moves
    .map((move) => ({ move, weight: moveWeight(move) }))
    .sort(SORT_FN)
    .map(({ move }) => move);
};
