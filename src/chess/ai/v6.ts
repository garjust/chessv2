import { ChessComputer, SearchResult } from './types';
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
    this.engine.position = position;
    this.diagnostics = new Diagnotics('v6', DEPTH);

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

    const moves = orderMoves(engine.generateMoves());
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
      return this.scoreCaptures(engine, alpha, beta);
    }

    const moves = orderMoves(engine.generateMoves());

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

  scoreCaptures(engine: Engine, alpha: number, beta: number): number {
    this.diagnostics.quiescenceNodeVisit();

    const x = engine.evaluateNormalized();
    if (x > alpha) {
      alpha = x;
    }
    if (alpha >= beta) {
      this.diagnostics.quiescenceCut();
      return alpha;
    }

    const moves = orderMoves(
      engine.generateMoves().filter((move) => move.attack)
    );

    for (const move of moves) {
      engine.applyMove(move);
      const x = -1 * this.scoreCaptures(engine, beta * -1, alpha * -1);
      engine.undoLastMove();

      if (x > alpha) {
        alpha = x;
      }
      if (alpha >= beta) {
        this.diagnostics.quiescenceCut();
        break;
      }
    }

    return alpha;
  }

  toJSON(): string {
    return 'justins chess computer v6';
  }
}
