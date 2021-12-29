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
import { applyMove, MoveResult, undoMove } from './move-execution';
import { generateMovementData } from './move-generation';

export default class Engine {
  #position: Position;
  #moveStack: MoveResult[] = [];

  // kings: {
  //   [Color.White]: Square;
  //   [Color.Black]: Square;
  // };

  constructor(position: Position) {
    this.#position = copyPosition(position);
  }

  applyMove(move: Move): Piece | undefined {
    const result = applyMove(this.#position, move);
    this.#moveStack.push(result);
    return result.captured?.piece;
  }

  undoLastMove() {
    const moveResult = this.#moveStack.pop();
    if (moveResult) {
      undoMove(this.#position, moveResult);
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
  applyMove(position: Position, move: Move) {
    const copy = Object.freeze(copyPosition(position));
    const result = applyMove(copy, move);
    return { position: copy, captured: result.captured };
  },
  evaluate,
  generateMoves(position: Position) {
    return generateMovementData(position).moves;
  },
  generateMovementData,
};
