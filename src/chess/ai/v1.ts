import { ChessComputer } from './types';
import { Position } from '../types';
import { flattenMoves } from '../utils';
import { computeAll } from '../engines/default/computed';
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

    return Promise.resolve(
      pluck(flattenMoves(computedPositionData.movesByPiece))
    );
  }

  toJSON(): string {
    return 'justins chess computer v1';
  }
}
