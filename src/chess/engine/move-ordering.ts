import { Move, MoveWithExtraData } from '../types';
import { HEATMAP_MULTIPLIER, PieceValue } from './evaluation';
import { HEATMAPS } from '../lib/heatmaps';
import { sort } from 'fast-sort';

const moveWeight = (move: MoveWithExtraData): number => {
  let n = 0;

  n +=
    (HEATMAPS[move.piece.type][move.piece.color][move.to] -
      HEATMAPS[move.piece.type][move.piece.color][move.from]) *
    HEATMAP_MULTIPLIER;

  if (move.attack) {
    n += Math.max(
      50,
      Math.min(
        PieceValue[move.attack.attacked.type] -
          PieceValue[move.attack.attacker.type],
        1000
      )
    );
  }
  if (move.promotion) {
    n += PieceValue[move.promotion];
  }

  return n;
};

const sortBy = (move: MoveWithExtraData) => {
  if (!move.weight) {
    move.weight = moveWeight(move);
  }

  return move.weight;
};

export const orderMoves = (moves: MoveWithExtraData[]): Move[] => {
  return sort(moves).desc(sortBy);
};
