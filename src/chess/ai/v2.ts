import { ChessComputer } from './types';
import { ComputedPositionData, Move, MovesByPiece, Position } from '../types';
import { computeAll } from '../engines/default/computed';

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

export default class v2 implements ChessComputer<Position> {
  nextMove(position: Position): Promise<Move> {
    return new Promise((resolve) => {
      resolve(this._nextMove(position));
    });
  }

  _nextMove(position: Position): Move {
    const computedPositionData = computeAll(position);

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
