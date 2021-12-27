import { ChessComputer } from './types';
import { Color, Move, Position } from '../types';
import { moveToDirectionString } from '../utils';
import engine from '../engine';
import { pluck } from '../../lib/array';

const DEPTH = 3;

export default class v3 implements ChessComputer<Position> {
  scoreCounter = 0;
  moveGenerationCounter = 0;

  nextMove(position: Position) {
    this.scoreCounter = 0;
    this.moveGenerationCounter = 0;

    const results = this.rootScores(position, DEPTH).sort(
      (a: { score: number }, b: { score: number }) => b.score - a.score
    );

    console.log(
      `results after ${this.scoreCounter} scores to depth ${DEPTH}; (${this.moveGenerationCounter} move generations)`,
      results.map(({ move, score }) => ({
        move: moveToDirectionString(move),
        score,
      }))
    );

    const bestScore = results[0].score;
    const move = pluck(results.filter(({ score }) => score === bestScore)).move;

    return Promise.resolve(move);
  }

  // evaluate(position: Position, normalization: EvaluationNormal): number {
  //   return engine.evaluate(position) * normalization;
  // }

  rootScores(
    position: Position,
    depth: number
  ): { move: Move; score: number }[] {
    const movementData = engine.generateMovementData(position);
    this.moveGenerationCounter++;

    return movementData.moves.map((move) => {
      const result = engine.applyMove(position, move);

      return {
        move,
        score: -1 * this.score(result.position, depth - 1),
      };
    });
  }

  score(position: Position, depth: number): number {
    this.scoreCounter++;

    if (depth === 0) {
      const evaluation = engine.evaluate(position);
      return position.turn === Color.White ? evaluation : -1 * evaluation;
    }

    let max = -Infinity;

    const moves = engine.generateMoves(position);
    this.moveGenerationCounter++;

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
