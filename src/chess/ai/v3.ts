import { ChessComputer } from './types';
import { Move, Position } from '../types';
import Engine from '../engine';
import { pluck } from '../../lib/array';
import Diagnotics from './diagnostics';

const DEPTH = 4;

// Algorithm:
// - simple negamax search
export default class v3 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v3', DEPTH);
  }

  get searchDiagnostics() {
    return this.diagnostics;
  }

  async nextMove(position: Position) {
    this.engine.position = position;
    this.diagnostics = new Diagnotics('v3', DEPTH);

    const rawScores = this.rootScores(this.engine, DEPTH);
    const results = [...rawScores].sort(
      (a: { score: number }, b: { score: number }) => b.score - a.score
    );

    const bestScore = results[0].score;
    const move = pluck(results.filter(({ score }) => score === bestScore)).move;

    this.diagnostics.recordResult(move, rawScores);
    return move;
  }

  rootScores(engine: Engine, depth: number): { move: Move; score: number }[] {
    const moves = engine.generateMoves();

    return moves.map((move) => {
      engine.applyMove(move);
      const result = {
        move,
        score: -1 * this.score(engine, depth - 1),
      };
      engine.undoLastMove();
      return result;
    });
  }

  score(engine: Engine, depth: number): number {
    this.diagnostics.nodeVisit(depth);

    if (depth === 0) {
      return engine.evaluateNormalized();
    }

    let max = -Infinity;
    const moves = engine.generateMoves();

    // handle no moves (checkmate or draw)
    moves.forEach((move) => {
      engine.applyMove(move);
      const x = -1 * this.score(engine, depth - 1);
      engine.undoLastMove();

      if (x > max) {
        max = x;
      }
    });

    return max;
  }

  toJSON(): string {
    return 'justins chess computer v3';
  }
}
