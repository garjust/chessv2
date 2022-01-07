import { ChessComputer } from './types';
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

    const alpha = -Infinity;
    const beta = Infinity;

    return moves.map((move) => {
      engine.applyMove(move);
      const result = {
        move,
        score: -1 * this.score(engine, depth - 1, alpha, beta),
      };
      engine.undoLastMove();

      // if (result.score >= beta) {
      //   beta = result.score;
      // }
      // if (result.score > alpha) {
      //   alpha = result.score;
      // }

      return result;
    });
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

      if (x >= beta) {
        this.diagnostics.cut(depth);
        return beta;
      }

      if (x > alpha) {
        alpha = x;
      }
    }

    return alpha;
  }

  toJSON(): string {
    return 'justins chess computer v4';
  }
}
