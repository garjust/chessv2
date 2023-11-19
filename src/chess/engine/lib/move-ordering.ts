import { sort } from 'fast-sort';
import { PieceValue } from '../../core/evaluation';
import { squareValueDiff } from '../../lib/heatmaps';
import { Move, MoveWithExtraData, Piece, Square } from '../../types';
import { moveEquals } from '../../utils';
import HistoryTable from './history-table';

const MAX = Number.MAX_SAFE_INTEGER;

const moveWeight = (
  pieces: Map<Square, Piece>,
  move: MoveWithExtraData,
  tableMove?: Move,
  pvMove?: Move,
  killerMove?: Move,
  historyTable?: HistoryTable,
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
        PieceValue[(pieces.get(move.to) as Piece).type] -
          PieceValue[move.piece.type],
        1000,
      ),
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
  pieces: Map<Square, Piece>,
  moves: MoveWithExtraData[],
  tableMove?: Move,
  pvMove?: Move,
  killerMove?: Move,
  historyTable?: HistoryTable,
): MoveWithExtraData[] => {
  const sortBy = (move: MoveWithExtraData) => {
    if (!move.weight) {
      move.weight = moveWeight(
        pieces,
        move,
        tableMove,
        pvMove,
        killerMove,
        historyTable,
      );
    }

    return move.weight;
  };

  return sort(moves).desc(sortBy);
};
