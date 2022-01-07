import { ChessComputer } from './types';
import { Move, Position } from '../types';
import Engine from '../engine';
import { pluck } from '../../lib/array';
import { orderMoves } from '../engine/move-ordering';
import Diagnotics from './diagnostics';

const DEPTH = 4;

// Algorithm:
// - move-ordered alpha-beta negamax search
// - search through captures
export default class v6 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;

  constructor() {
    this.engine = new Engine();
    this.diagnostics = new Diagnotics('v6', DEPTH);
  }

  get searchDiagnostics() {
    return this.diagnostics;
  }

  async nextMove(position: Position) {
    this.diagnostics = new Diagnotics('v6', DEPTH);
    this.engine.position = position;

    const results = this.rootScores(this.engine, DEPTH).sort(
      (a: { score: number }, b: { score: number }) => b.score - a.score
    );

    const bestScore = results[0].score;
    const move = pluck(results.filter(({ score }) => score === bestScore)).move;

    this.diagnostics.recordResult(move, results);
    return move;
  }

  rootScores(engine: Engine, depth: number): { move: Move; score: number }[] {
    const moves = orderMoves(engine.generateMoves());

    return moves.map((move) => {
      engine.applyMove(move);
      const result = {
        move,
        score: -1 * this.score(engine, depth - 1, -Infinity, Infinity),
      };
      engine.undoLastMove();
      return result;
    });
  }

  score(engine: Engine, depth: number, alpha: number, beta: number): number {
    this.diagnostics.nodeVisit(depth);

    if (depth === 0) {
      return this.scoreCaptures(engine, alpha, beta);
    }

    const moves = orderMoves(engine.generateMoves());

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

  scoreCaptures(engine: Engine, alpha: number, beta: number): number {
    this.diagnostics.quiescenceNodeVisit();

    const evaluation = engine.evaluateNormalized();
    if (evaluation >= beta) {
      this.diagnostics.quiescenceCut();
      return beta;
    }
    if (evaluation > alpha) {
      alpha = evaluation;
    }

    const moves = orderMoves(
      engine.generateMoves().filter((move) => move.attack)
    );

    for (const move of moves) {
      engine.applyMove(move);
      const x = -1 * this.scoreCaptures(engine, beta * -1, alpha * -1);
      engine.undoLastMove();

      if (x >= beta) {
        return beta;
      }

      if (x > alpha) {
        alpha = x;
      }
    }

    return alpha;
  }

  toJSON(): string {
    return 'justins chess computer v6';
  }
}
