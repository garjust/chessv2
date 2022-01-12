import { Move, MoveWithExtraData } from '../types';
import { PieceValue } from './evaluation';
import { squareValueDiff } from '../lib/heatmaps';
import { sort } from 'fast-sort';

const moveWeight = (move: MoveWithExtraData): number => {
  let n = 0;

  n += squareValueDiff(move, move.piece);

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
