import { ChessComputer } from './types';
import { Position } from '../types';
import { computeAll } from '../engine/computed';
import { pluck } from '../../lib/array';

export default class v1 implements ChessComputer<Position> {
  nextMove(position: Position) {
    const computedPositionData = computeAll(position);

    if (computedPositionData.availableChecks.length) {
      return Promise.resolve(pluck(computedPositionData.availableChecks));
    }

    if (computedPositionData.availableCaptures.length) {
      return Promise.resolve(pluck(computedPositionData.availableCaptures));
    }

    return Promise.resolve(pluck(computedPositionData.moves));
  }

  toJSON(): string {
    return 'justins chess computer v1';
  }
}
