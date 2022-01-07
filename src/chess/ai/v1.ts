import { ChessComputer } from './types';
import { Position } from '../types';
import { pluck } from '../../lib/array';
import Engine from '../engine';

// Algorithm:
// - pick a random move
export default class v1 implements ChessComputer {
  engine: Engine;

  constructor() {
    this.engine = new Engine();
  }

  async nextMove(position: Position) {
    this.engine.position = position;
    const moves = this.engine.generateMoves();

    const captures = moves.filter((move) => move.attack);
    if (captures.length > 0) {
      return pluck(captures);
    }

    return pluck(moves);
  }

  toJSON(): string {
    return 'justins chess computer v1';
  }
}
