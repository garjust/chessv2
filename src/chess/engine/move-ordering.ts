import { Move, MoveWithExtraData } from '../types';
import { PieceValue } from './evaluation';
import { squareValueDiff } from '../lib/heatmaps';
import { sort } from 'fast-sort';
import { moveEquals } from '../utils';
import { IHistoryTable } from './types';

const MAX = Number.MAX_SAFE_INTEGER;

const moveWeight = (
  move: MoveWithExtraData,
  tableMove?: Move,
  pvMove?: Move,
  killerMove?: Move,
  historyTable?: IHistoryTable
): number => {
  let n = 0;

  if (moveEquals(move, tableMove)) {
    return MAX;
  } else if (moveEquals(move, pvMove)) {
    return MAX - 1;
  } else if (moveEquals(move, killerMove)) {
    return MAX - 2;
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
  tableMove?: Move,
  pvMove?: Move,
  killerMove?: Move,
  historyTable?: IHistoryTable
): MoveWithExtraData[] => {
  const sortBy = (move: MoveWithExtraData) => {
    if (!move.weight) {
      move.weight = moveWeight(
        move,
        tableMove,
        pvMove,
        killerMove,
        historyTable
      );
    }

    return move.weight;
  };

  return sort(moves).desc(sortBy);
};
