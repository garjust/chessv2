import { ChessComputer } from './types';
import { Move, Position } from '../types';
import { flattenMoves } from '../utils';
import { computeAll } from '../engines/default/computed';

const pluck = <T>(array: Array<T>): T =>
  array[Math.floor(Math.random() * array.length)];

export default class v1 implements ChessComputer<Position> {
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

    return pluck(flattenMoves(computedPositionData.movesByPiece));
  }

  toJSON(): string {
    return 'justins chess computer v1';
  }
}
