import { ChessComputer } from './types';
import { Position } from '../types';
import { pluck } from '../../lib/array';
import { ImmutableEngine } from '../engine';

// Algorithm:
// - pick a random move
export default class v1 implements ChessComputer<Position> {
  nextMove(position: Position) {
    const movementData = ImmutableEngine.generateMovementData(position);

    if (movementData.availableCaptures.length) {
      return Promise.resolve(pluck(movementData.availableCaptures));
    }

    return Promise.resolve(pluck(movementData.moves));
  }

  toJSON(): string {
    return 'justins chess computer v1';
  }
}
