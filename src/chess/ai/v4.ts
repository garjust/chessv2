import { ChessComputer, SearchResult } from './types';
import { Move, Position } from '../types';
import Engine from '../engine';
import { pluck } from '../../lib/array';
import Diagnotics from './diagnostics';

const DEPTH = 4;

// Algorithm:
// - simple alpha-beta negamax search
export default class v4 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v4', DEPTH);
  }

  get searchDiagnostics() {
    return this.diagnostics;
  }

  async nextMove(position: Position) {
    this.engine.position = position;
    this.diagnostics = new Diagnotics('v4', DEPTH);

    const { scores, move } = this.rootScores(this.engine, DEPTH);

    this.diagnostics.recordResult(move, scores);
    return move;
  }

  rootScores(engine: Engine, depth: number): SearchResult {
    const scores: { move: Move; score: number }[] = [];
    // Start with an illegal move so it is well defined.
    let bestMove: Move = { from: -1, to: -1 };

    let alpha = -Infinity;
    const beta = Infinity;

    const moves = engine.generateMoves();
    for (const move of moves) {
      engine.applyMove(move);
      const result = {
        move,
        score: -1 * this.score(engine, depth - 1, beta * -1, alpha * -1),
      };
      engine.undoLastMove();

      scores.push(result);

      if (result.score > alpha) {
        bestMove = result.move;
        alpha = result.score;
      }
    }

    return { scores, move: bestMove };
  }

  score(engine: Engine, depth: number, alpha: number, beta: number): number {
    this.diagnostics.nodeVisit(depth);

    if (depth === 0) {
      return engine.evaluateNormalized();
    }

    const moves = engine.generateMoves();

    for (const move of moves) {
      engine.applyMove(move);
      const x = -1 * this.score(engine, depth - 1, beta * -1, alpha * -1);
      engine.undoLastMove();

      if (x > alpha) {
        alpha = x;
      }
      if (alpha >= beta) {
        this.diagnostics.cut(depth);
        break;
      }
    }

    return alpha;
  }

  toJSON(): string {
    return 'justins chess computer v4';
  }
}
