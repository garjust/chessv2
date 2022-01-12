import { Move, MoveWithExtraData } from '../types';
import { PieceValue } from './evaluation';
import { squareValueDiff } from '../lib/heatmaps';
import { sort } from 'fast-sort';
import { moveEquals } from '../utils';
import { IHistoryTable } from '../ai/types';

const moveWeight = (
  move: MoveWithExtraData,
  killerMove?: Move,
  pvMove?: Move,
  historyTable?: IHistoryTable
): number => {
  let n = 0;

  if (moveEquals(move, pvMove)) {
    return 1_000_000;
  } else if (moveEquals(move, killerMove)) {
    return 999_999;
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
  } else if (historyTable) {
    // assign value using history heuristic
    n += historyTable.get(move);
  }

  if (move.promotion) {
    n += PieceValue[move.promotion];
  }

  return n;
};

export const orderMoves = (
  moves: MoveWithExtraData[],
  killerMove?: Move,
  pvMove?: Move,
  historyTable?: IHistoryTable
): MoveWithExtraData[] => {
  const sortBy = (move: MoveWithExtraData) => {
    if (!move.weight) {
      move.weight = moveWeight(move, killerMove, pvMove, historyTable);
    }

    return move.weight;
  };

  return sort(moves).desc(sortBy);
};
