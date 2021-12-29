import {
  Color,
  ComputedMovementData,
  Move,
  Piece,
  Position as ExternalPosition,
  Square,
} from '../types';
import { copyPosition } from '../utils';
import { evaluate } from './evaluation';
import { applyMove, MoveResult, undoMove } from './move-execution';
import { generateMovementData } from './move-generation';
import { Position, convertToInternal } from './position';

export default class Engine {
  #position: Position;
  #moveStack: MoveResult[] = [];

  constructor(position: ExternalPosition) {
    this.#position = convertToInternal(copyPosition(position));
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

  get position(): ExternalPosition {
    return copyPosition(this.#position);
  }
}

export const ImmutableEngine = {
  applyMove(position: ExternalPosition, move: Move) {
    const copy = copyPosition(position);
    const result = applyMove(convertToInternal(copy), move);
    return { position: Object.freeze(copy), captured: result.captured };
  },
  evaluate,
  generateMoves(position: ExternalPosition) {
    const copy = copyPosition(position);
    return generateMovementData(convertToInternal(copy)).moves;
  },
  generateMovementData(position: ExternalPosition) {
    const copy = copyPosition(position);
    return generateMovementData(convertToInternal(copy));
  },
};
