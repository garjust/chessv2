import { ChessComputer } from './types';
import { Move, MovesByPiece, Position } from '../types';
import { computeAll } from '../engines/default/computed';
import { pluck } from '../../lib/array';

const flattenMovesLess = (mapByPiece: MovesByPiece): Move[][] => {
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
  nextMove(position: Position) {
    const computedPositionData = computeAll(position);

    if (computedPositionData.availableChecks.length) {
      return Promise.resolve(pluck(computedPositionData.availableChecks));
    }

    if (computedPositionData.availableCaptures.length) {
      return Promise.resolve(pluck(computedPositionData.availableCaptures));
    }

    return Promise.resolve(
      pluck(pluck(flattenMovesLess(computedPositionData.movesByPiece)))
    );
  }

  toJSON(): string {
    return 'justins chess computer v2';
  }
}
