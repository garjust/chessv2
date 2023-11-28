import { Color, Square, SquareControl, Position } from '../types';
import { squareGenerator } from '../utils';
import { forPiece } from './piece-movement-control';

enum UpdateType {
  FullRemove,
  PartialRemove,
  PartialAdd,
}

type Update = {
  type: UpdateType;
  square: Square;
  squares: SquareControl[];
};

export default class AttackMap {
  /**
   * Store all SquareControl objects owned by the piece residing in the
   * key square. This is effectively a near-complete set of moves in the
   * position keyed by piece.
   *
   * Originally implemented as a Map, this was refactored to an array for
   * faster access.
   */
  _squareControlByPiece: SquareControl[][] = [];
  /**
   * Store all squares which attack each square. This acts as an inverse to
   * the other data structure, storing SquareControl objects from the perspective
   * of the controlled square rather than the controller's square.
   *
   * Originally implemented as a Map, this was refactored to an array for
   * faster access. The array values are still maps to be able to query size
   * quickly.
   */
  _squareControlByAttackedSquare: Map<Square, SquareControl>[] = [];

  _updatesStack: Update[][] = [];

  constructor(position: Position, color: Color) {
    for (const square of squareGenerator()) {
      this._squareControlByPiece[square] = [];
    }
    for (const square of squareGenerator()) {
      this._squareControlByAttackedSquare[square] = new Map();
    }

    for (const [square, piece] of position.pieces) {
      if (piece.color !== color) {
        continue;
      }

      const squareControl = forPiece(piece, position.pieces, square);
      this.addAttacksForPiece(square, squareControl);
    }
  }

  isAttacked(square: Square): boolean {
    return this._squareControlByAttackedSquare[square].size > 0;
  }

  controlForPiece(square: Square): SquareControl[] {
    return this._squareControlByPiece[square] ?? [];
  }

  attackCounts(): IterableIterator<[Square, number]> {
    const byAttackedSquare = this._squareControlByAttackedSquare;
    return (function* () {
      for (const square of squareGenerator()) {
        yield [square, byAttackedSquare[square].size];
      }
    })();
  }

  controlOfSquare(square: Square) {
    const map = this._squareControlByAttackedSquare[square];
    if (!map) {
      throw Error('there should be a map');
    }
    return map.entries();
  }

  startUpdates(): void {
    this._updatesStack.push([]);
  }

  revert(): void {
    const removals = this._updatesStack.pop() ?? [];
    for (const change of removals) {
      switch (change.type) {
        case UpdateType.FullRemove:
          this.removeAttacksForPiece(change.square, false);
          this.addAttacksForPiece(change.square, change.squares);
          break;
        case UpdateType.PartialRemove:
          this.addAttacks(change.square, change.squares, false);
          break;
        case UpdateType.PartialAdd:
          this.removeAttacks(change.square, change.squares, false);
          break;
      }
    }
  }

  addAttacksForPiece(square: Square, squares: SquareControl[]): void {
    for (const squareControl of squares) {
      this._squareControlByAttackedSquare[squareControl.to].set(
        squareControl.from,
        squareControl,
      );
    }
    this._squareControlByPiece[square] = squares;
  }

  addAttacks(square: Square, squares: SquareControl[], cache = true): void {
    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: UpdateType.PartialAdd,
        square,
        squares,
      });
    }

    for (const squareControl of squares) {
      this._squareControlByAttackedSquare[squareControl.to].set(
        squareControl.from,
        squareControl,
      );
    }
    const existing = this._squareControlByPiece[square];
    if (!existing) {
      throw Error('there should be square control from this square');
    }
    existing.push(...squares);
  }

  removeAttacksForPiece(square: Square, cache = true): void {
    const squares = this._squareControlByPiece[square] ?? [];
    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: UpdateType.FullRemove,
        square,
        squares,
      });
    }

    for (const squareControl of squares) {
      const squareControlExists = this._squareControlByAttackedSquare[
        squareControl.to
      ].has(squareControl.from);
      if (!squareControlExists) {
        throw Error('cannot remove attack that does not exist');
      }

      this._squareControlByAttackedSquare[squareControl.to].delete(
        squareControl.from,
      );
    }
    this._squareControlByPiece[square] = [];
  }

  removeAttacks(square: Square, squares: SquareControl[], cache = true): void {
    const existing = this._squareControlByPiece[square];
    if (!existing) {
      throw Error('there should be square control from this square');
    }

    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: UpdateType.PartialRemove,
        square,
        squares,
      });
    }

    const squaresToRemove = squares.map((squareControl) => squareControl.to);

    for (const squareControl of squares) {
      const squareControlExists = this._squareControlByAttackedSquare[
        squareControl.to
      ].has(squareControl.from);
      if (!squareControlExists) {
        throw Error('cannot remove attack that does not exist');
      }

      this._squareControlByAttackedSquare[squareControl.to].delete(
        squareControl.from,
      );
    }

    for (let i = existing.length - 1; i >= 0; i--) {
      const control = existing[i];
      if (squaresToRemove.includes(control.to)) {
        existing.splice(i, 1);
      }
    }
  }
}
