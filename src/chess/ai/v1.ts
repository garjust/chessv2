import { ChessComputer } from './types';
import { ComputedPositionData, Move, MovesByPiece, Position } from '../types';
import { flattenMoves } from '../utils';

const pluck = <T>(array: Array<T>): T =>
  array[Math.floor(Math.random() * array.length)];

export default class v1 implements ChessComputer {
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
