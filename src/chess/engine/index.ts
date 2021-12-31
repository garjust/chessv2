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
import { copyToInternal, copyToExternal } from './position';
import { Position } from './types';

export default class Engine {
  _position: Position;
  _moveStack: MoveResult[] = [];

  constructor(position: ExternalPosition) {
    this._position = copyToInternal(position);
  }

  applyMove(move: Move): Piece | undefined {
    const result = applyMove(this._position, move);
    this._moveStack.push(result);
    return result.captured?.piece;
  }

  undoLastMove() {
    const moveResult = this._moveStack.pop();
    if (moveResult) {
      undoMove(this._position, moveResult);
    } else {
      throw Error('no last move to undo');
    }
  }

  evaluate(): number {
    return evaluate(this._position);
  }

  evaluateNormalized(): number {
    return this._position.turn === Color.White
      ? this.evaluate()
      : -1 * this.evaluate();
  }

  generateMoves(): Move[] {
    return this.generateMovementData().moves;
  }

  generateMovementData(): ComputedMovementData {
    return generateMovementData(
      this._position.pieces,
      this._position.turn,
      this._position,
      {
        pinsToKing: this._position.pinsToKing,
        kings: this._position.kings,
        enPassantSquare: this._position.enPassantSquare,
        castlingAvailability: this._position.castlingAvailability,
      }
    );
  }

  get position(): ExternalPosition {
    return copyToExternal(this._position);
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
