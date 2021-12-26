import { ChessComputer } from './types';
import { Color, Position } from '../types';
import { moveToDirectionString } from '../utils';
import engine from '../engines/default';
import { computeAll } from '../engines/default/computed';
import { pluck } from '../../lib/array';

const DEPTH = 2;

export default class v3 implements ChessComputer<Position> {
  counter = 0;

  nextMove(position: Position) {
    this.counter = 0;

    const computedPositionData = computeAll(position);

    const normalization = position.turn === Color.White ? 1 : -1;

    const results = computedPositionData.moves
      .map((move) => {
        const result = engine.applyMove(position, move);

        return {
          move,
          score: normalization * this.score(result.position, DEPTH),
        };
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    const bestScore = results[0].score;

    console.log(
      `results after ${this.counter} scores to depth ${DEPTH}`,
      results.map(({ move, score }) => ({
        move: moveToDirectionString(move),
        score,
      }))
    );

    const move = pluck(results.filter(({ score }) => score === bestScore)).move;

    return Promise.resolve(move);
  }

  score(position: Position, depth: number): number {
    this.counter++;

    const computedPositionData = computeAll(position);

    if (depth === 0) {
      return computedPositionData.evaluation;
    }

    let n = -Infinity;

    // handle no moves (checkmate or draw)
    computedPositionData.moves.forEach((move) => {
      const result = engine.applyMove(position, move);
      const m = -1 * this.score(result.position, depth - 1);

      if (m > n) {
        n = m;
      }
    });

    return n;
  }

  toJSON(): string {
    return 'justins chess computer v3';
  }
}