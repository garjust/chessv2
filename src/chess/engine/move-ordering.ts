import { Move, MoveWithExtraData } from '../types';
import { PieceValue } from './evaluation';
import { squareValueDiff } from '../lib/heatmaps';
import { sort } from 'fast-sort';
import { moveEquals } from '../utils';

const moveWeight = (move: MoveWithExtraData, killerMove?: Move): number => {
  let n = 0;

  if (moveEquals(move, killerMove)) {
    return Infinity;
  }

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

export const orderMoves = (
  moves: MoveWithExtraData[],
  killerMove?: Move
): MoveWithExtraData[] => {
  const sortBy = (move: MoveWithExtraData) => {
    if (!move.weight) {
      move.weight = moveWeight(move, killerMove);
    }

    return move.weight;
  };

  return sort(moves).desc(sortBy);
};
