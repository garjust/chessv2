import { ChessComputer } from './types';
import { Position } from '../types';
import { pluck } from '../../lib/array';
import Engine from '../engine';

// Algorithm:
// - pick a random move
export default class v1 implements ChessComputer<Position> {
  nextMove(position: Position) {
    const engine = new Engine(position);
    const movementData = engine.generateMovementData();

    const captures = movementData.moves.filter((move) => move.attack);
    if (captures.length > 0) {
      return Promise.resolve(pluck(captures));
    }

    return Promise.resolve(pluck(movementData.moves));
  }

  toJSON(): string {
    return 'justins chess computer v1';
  }
}
