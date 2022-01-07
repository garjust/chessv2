import { ChessComputer } from './types';
import { Move, Position } from '../types';
import { pluck } from '../../lib/array';
import Engine from '../engine';
import Diagnotics from './diagnostics';

// Algorithm:
// - pick a random move
export default class v1 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v1', 0);
  }

  get searchDiagnostics() {
    return this.diagnostics;
  }

  async nextMove(position: Position) {
    this.engine.position = position;
    this.diagnostics = new Diagnotics('v1', 0);

    let move: Move | undefined;
    const moves = this.engine.generateMoves();

    const captures = moves.filter((move) => move.attack);
    if (captures.length > 0) {
      move = pluck(captures);
    }

    if (!move) {
      move = pluck(moves);
    }

    this.diagnostics.recordResult(
      move,
      moves.map((move) => ({ move, score: 0 }))
    );
    return move;
  }

  toJSON(): string {
    return 'justins chess computer v1';
  }
}
