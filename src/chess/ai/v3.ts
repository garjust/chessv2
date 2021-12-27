import { ChessComputer } from './types';
import { Color, Position } from '../types';
import { moveToDirectionString } from '../utils';
import engine from '../engine';
import { pluck } from '../../lib/array';

const DEPTH = 3;

type EvaluationNormal = -1 | 1;

export default class v3 implements ChessComputer<Position> {
  scoreCounter = 0;
  moveGenerationCounter = 0;

  nextMove(position: Position) {
    this.scoreCounter = 0;
    this.moveGenerationCounter = 0;

    const movementData = engine.generateMovementData(position);
    this.moveGenerationCounter++;

    const normalization = position.turn === Color.White ? 1 : -1;

    const results = movementData.moves
      .map((move) => {
        const result = engine.applyMove(position, move);

        return {
          move,
          score:
            normalization *
            this.score(result.position, normalization, DEPTH - 1),
        };
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

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

  evaluate(position: Position, normalization: EvaluationNormal): number {
    return engine.evaluate(position) * normalization;
  }

  score(
    position: Position,
    normalization: EvaluationNormal,
    depth: number
  ): number {
    this.scoreCounter++;

    if (depth === 0) {
      return this.evaluate(position, normalization);
    }

    const moves = engine.generateMoves(position);
    this.moveGenerationCounter++;
    let max = -Infinity;

    // handle no moves (checkmate or draw)
    moves.forEach((move) => {
      const result = engine.applyMove(position, move);
      const m = -1 * this.score(result.position, normalization, depth - 1);

      if (m > max) {
        max = m;
      }
    });

    return max;
  }

  toJSON(): string {
    return 'justins chess computer v3';
  }
}
