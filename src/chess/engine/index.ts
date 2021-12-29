import {
  Color,
  ComputedMovementData,
  Move,
  Piece,
  Position as ExternalPosition,
} from '../types';
import { evaluate } from './evaluation';
import { applyMove, MoveResult, undoMove } from './move-execution';
import { generateMovementData } from './move-generation';
import { Position, copyToInternal, copyToExternal } from './position';

export default class Engine {
  #position: Position;
  #moveStack: MoveResult[] = [];

  constructor(position: ExternalPosition) {
    this.#position = copyToInternal(position);
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
    return copyToExternal(this.#position);
  }
}

export const ImmutableEngine = {
  applyMove(position: ExternalPosition, move: Move) {
    const engine = new Engine(position);
    const captured = engine.applyMove(move);
    return {
      position: Object.freeze(engine.position),
      captured,
    };
  },
  evaluate(position: ExternalPosition) {
    const engine = new Engine(position);
    return engine.evaluate();
  },
  generateMoves(position: ExternalPosition) {
    const engine = new Engine(position);
    return engine.generateMovementData().moves;
  },
  generateMovementData(position: ExternalPosition) {
    const engine = new Engine(position);
    return engine.generateMovementData();
  },
};
