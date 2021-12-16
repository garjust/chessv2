import { ChessComputer } from '../types';
import {
  ComputedPositionData,
  Move,
  PieceType,
  Position,
  Square,
} from '../../types';
import { SquareMap } from '../../utils';

const pluck = <T>(array: Array<T>): T =>
  array[Math.floor(Math.random() * array.length)];

const flattenMoves = (
  mapByPiece: Map<PieceType, SquareMap<Square[]>>
): Move[] => {
  const moves: Move[] = [];

  for (const map of mapByPiece.values()) {
    for (const [from, squares] of map.entries()) {
      for (const to of squares) {
        moves.push({ from, to });
      }
    }
  }

  return moves;
};

export default class AI implements ChessComputer {
  nextMove(
    position: Position,
    computedPositionData: ComputedPositionData
  ): Move {
    if (computedPositionData.availableChecks.length) {
      return pluck(computedPositionData.availableChecks);
    }

    if (computedPositionData.availableCaptures.length) {
      return pluck(computedPositionData.availableCaptures);
    }

    return pluck(flattenMoves(computedPositionData.movesByPiece));
  }

  toJSON(): string {
    return 'justins chess computer v1';
  }
}
