import { ChessComputer } from './types';
import { Move, Position } from '../types';
import { moveString } from '../utils';
import Engine from '../engine';
import { pluck } from '../../lib/array';

const DEPTH = 4;

// Algorithm:
// - simple negamax search
export default class v3 implements ChessComputer {
  engine: Engine;
  moveCounter = 0;
  evaluationCounter = 0;

  constructor() {
    this.engine = new Engine();
  }

  async nextMove(position: Position) {
    this.engine.position = position;

    this.moveCounter = 0;
    this.evaluationCounter = 0;

    const results = this.rootScores(this.engine, DEPTH).sort(
      (a: { score: number }, b: { score: number }) => b.score - a.score
    );

    console.log(
      `v3 results for DEPTH=${DEPTH}: moves=${this.moveCounter}; evaluations=${this.evaluationCounter};`,
      results.map(({ move, score }) => ({
        move: moveString(move),
        score,
      }))
    );

    const bestScore = results[0].score;
    const move = pluck(results.filter(({ score }) => score === bestScore)).move;

    return move;
  }

  rootScores(engine: Engine, depth: number): { move: Move; score: number }[] {
    const moves = engine.generateMoves();
    this.moveCounter += moves.length;

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
    if (depth === 0) {
      this.evaluationCounter++;
      return engine.evaluateNormalized();
    }

    let max = -Infinity;

    const moves = engine.generateMoves();
    this.moveCounter += moves.length;

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
