import { ChessComputer } from './types';
import { Color, ComputedPositionData, Move, Position } from '../types';
import { flattenMoves, moveToDirectionString } from '../utils';
import { applyMove } from '../engine/move-execution';
import { computeAll } from '../engine/computed';

const DEPTH = 2;

const pluck = <T>(array: Array<T>): T =>
  array[Math.floor(Math.random() * array.length)];

type Node = {
  position: Position;
  computedPositionData: ComputedPositionData;
  normalizedEvaluation: number;
};

const RESULTS_SORT = {
  [Color.White]: (a: { evaluation: number }, b: { evaluation: number }) =>
    b.evaluation - a.evaluation,
  [Color.Black]: (a: { evaluation: number }, b: { evaluation: number }) =>
    a.evaluation - b.evaluation,
};

export default class v3 implements ChessComputer {
  counter = 0;

  nextMove(
    position: Position,
    computedPositionData: ComputedPositionData
  ): Promise<Move> {
    this.counter = 0;
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(this._nextMove(position, computedPositionData));
      }, 100)
    );
  }

  _nextMove(
    position: Position,
    computedPositionData: ComputedPositionData
  ): Move {
    const moves = flattenMoves(computedPositionData.movesByPiece);

    const results = moves
      .map((move) => {
        const result = applyMove(position, move);
        const computedPositionData = computeAll(result.position);

        return {
          move,
          evaluation: this.score(
            {
              position: result.position,
              computedPositionData,
              normalizedEvaluation: computedPositionData.evaluation,
            },
            DEPTH,
            position.turn === Color.White ? 1 : -1
          ),
        };
      })
      .sort(RESULTS_SORT[position.turn]);
    const bestEvaluation = results[0].evaluation;

    console.log(
      `results after ${this.counter} scores`,
      results.map(({ move, evaluation }) => ({
        move: moveToDirectionString(move),
        evaluation,
      }))
    );

    return pluck(
      results.filter(({ evaluation }) => evaluation === bestEvaluation)
    ).move;
  }

  score(node: Node, depth: number, normalization: -1 | 1): number {
    this.counter++;
    if (depth === 0) {
      return node.normalizedEvaluation;
    }

    let n = -Infinity;

    // handle no moves (checkmate or draw)
    flattenMoves(node.computedPositionData.movesByPiece).forEach((move) => {
      const result = applyMove(node.position, move);
      const computedPositionData = computeAll(result.position);
      const m =
        -1 *
        this.score(
          {
            position: result.position,
            computedPositionData,
            normalizedEvaluation: computedPositionData.evaluation,
          },
          depth - 1,
          normalization
        );

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
