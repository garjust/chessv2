import { ChessComputer } from './types';
import { Color, Move, Position } from '../types';
import { moveToDirectionString } from '../utils';
import engine from '../engine';
import { pluck } from '../../lib/array';

const DEPTH = 4;

// Algorithm:
// - simple negamax search
export default class v3 implements ChessComputer<Position> {
  moveCounter = 0;
  evaluationCounter = 0;

  nextMove(position: Position) {
    this.moveCounter = 0;
    this.evaluationCounter = 0;

    const results = this.rootScores(position, DEPTH).sort(
      (a: { score: number }, b: { score: number }) => b.score - a.score
    );

    console.log(
      `v3 results for DEPTH=${DEPTH}: moves=${this.moveCounter}; evaluations=${this.evaluationCounter};`,
      results.map(({ move, score }) => ({
        move: moveToDirectionString(move),
        score,
      }))
    );

    const bestScore = results[0].score;
    const move = pluck(results.filter(({ score }) => score === bestScore)).move;

    return Promise.resolve(move);
  }

  rootScores(
    position: Position,
    depth: number
  ): { move: Move; score: number }[] {
    const moves = engine.generateMoves(position);
    this.moveCounter += moves.length;

    return moves.map((move) => {
      const result = engine.applyMove(position, move);

      return {
        move,
        score: -1 * this.score(result.position, depth - 1),
      };
    });
  }

  score(position: Position, depth: number): number {
    if (depth === 0) {
      this.evaluationCounter++;
      const evaluation = engine.evaluate(position);
      return position.turn === Color.White ? evaluation : -1 * evaluation;
    }

    let max = -Infinity;

    const moves = engine.generateMoves(position);
    this.moveCounter += moves.length;

    // handle no moves (checkmate or draw)
    moves.forEach((move) => {
      const result = engine.applyMove(position, move);
      const x = -1 * this.score(result.position, depth - 1);

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
