import { ChessComputer } from './types';
import { Color, Move, Position } from '../types';
import { moveToDirectionString } from '../utils';
import { ImmutableEngine } from '../engine';
import { pluck } from '../../lib/array';

const DEPTH = 4;

// Algorithm:
// - simple alpha-beta negamax search
export default class v4 implements ChessComputer<Position> {
  moveCounter = 0;
  evaluationCounter = 0;

  nextMove(position: Position) {
    this.moveCounter = 0;
    this.evaluationCounter = 0;

    const results = this.rootScores(position, DEPTH).sort(
      (a: { score: number }, b: { score: number }) => b.score - a.score
    );

    console.log(
      `v4 results for DEPTH=${DEPTH}: moves=${this.moveCounter}; evaluations=${this.evaluationCounter};`,
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
    const moves = ImmutableEngine.generateMoves(position);
    this.moveCounter += moves.length;

    return moves.map((move) => {
      const result = ImmutableEngine.applyMove(position, move);

      return {
        move,
        score: -1 * this.score(result.position, depth - 1, -Infinity, Infinity),
      };
    });
  }

  score(
    position: Position,
    depth: number,
    alpha: number,
    beta: number
  ): number {
    if (depth === 0) {
      this.evaluationCounter++;
      const evaluation = ImmutableEngine.evaluate(position);
      return position.turn === Color.White ? evaluation : -1 * evaluation;
    }

    const moves = ImmutableEngine.generateMoves(position);
    this.moveCounter += moves.length;

    for (const move of moves) {
      const result = ImmutableEngine.applyMove(position, move);
      const x =
        -1 * this.score(result.position, depth - 1, beta * -1, alpha * -1);

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
    return 'justins chess computer v4';
  }
}
