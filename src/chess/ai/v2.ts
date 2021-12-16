import { ChessComputer } from './types';
import { ComputedPositionData, Move, MovesByPiece, Position } from '../types';

const pluck = <T>(array: Array<T>): T =>
  array[Math.floor(Math.random() * array.length)];

const flattenMoves = (mapByPiece: MovesByPiece): Move[][] => {
  const moves: Move[][] = [];

  for (const map of mapByPiece.values()) {
    for (const [from, squares] of map.entries()) {
      const tempMoves: Move[] = [];
      for (const { to } of squares) {
        tempMoves.push({ from, to });
      }
      if (tempMoves.length > 0) {
        moves.push(tempMoves);
      }
    }
  }

  return moves;
};

export default class v2 implements ChessComputer {
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

    return pluck(pluck(flattenMoves(computedPositionData.movesByPiece)));
  }

  toJSON(): string {
    return 'justins chess computer v2';
  }
}
