import { threadId } from 'worker_threads';
import {
  Color,
  ComputedMovementData,
  Move,
  Piece,
  Position,
  Square,
} from '../types';
import { copyPosition } from './copy';
import { evaluate } from './evaluation';
import { applyMove } from './move-execution';
import { generateMovementData } from './move-generation';

export default class Engine {
  #position: Position;
  #positionStack: Position[] = [];

  // kings: {
  //   [Color.White]: Square;
  //   [Color.Black]: Square;
  // };

  constructor(position: Position) {
    this.#position = copyPosition(position);
  }

  applyMove(move: Move): Piece | undefined {
    const { position, captured } = applyMove(this.#position, move);
    this.#positionStack.push(this.#position);
    this.#position = position;
    return captured;
  }

  undoLastMove() {
    const lastPosition = this.#positionStack.pop();
    if (lastPosition) {
      this.#position = lastPosition;
    } else {
      throw Error('no last move to undo');
    }
  }

  evaluate(): number {
    return evaluate(this.#position);
  }

  evaluateNormalized(): number {
    return this.#position.turn === Color.White
      ? this.evaluate()
      : -1 * this.evaluate();
  }

  generateMoves(): Move[] {
    return this.generateMovementData().moves;
  }

  generateMovementData(): ComputedMovementData {
    return generateMovementData(this.#position);
  }

  get position(): Position {
    return copyPosition(this.#position);
  }
}

export const ImmutableEngine = {
  applyMove,
  evaluate,
  generateMoves: (position: Position) => generateMovementData(position).moves,
  generateMovementData,
};
