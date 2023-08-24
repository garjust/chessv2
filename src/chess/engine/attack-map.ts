import {
  Color,
  Square,
  SquareControlObject,
  Position as ExternalPosition,
} from '../types';
import { forPiece } from './piece-movement-control';

enum UpdateType {
  FullRemove,
  PartialRemove,
  PartialAdd,
}

type Update = {
  type: UpdateType;
  square: Square;
  squares: SquareControlObject[];
};

export default class AttackMap {
  // Store all squares controlled by the piece residing in
  // the key square.
  _squareControlByPiece = new Map<Square, SquareControlObject[]>();
  // Store all squares which attack each square. Use a Square-keyed map so we
  // can quickly add/remove/enumerate the attacks on a square.
  _squareControlByAttackedSquare = new Map<
    Square,
    Map<Square, SquareControlObject>
  >();

  _updatesStack: Update[][] = [];

  constructor(position: ExternalPosition, color: Color) {
    for (let i = 0; i < 64; i++) {
      this._squareControlByPiece.set(i, []);
    }
    for (let i = 0; i < 64; i++) {
      this._squareControlByAttackedSquare.set(i, new Map());
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
    return (this._squareControlByAttackedSquare.get(square)?.size ?? 0) > 0;
  }

  controlForPiece(square: number): SquareControlObject[] {
    return this._squareControlByPiece.get(square) ?? [];
  }

  attackCounts(): IterableIterator<[Square, number]> {
    const byAttackedSquare = this._squareControlByAttackedSquare;
    return (function* () {
      for (const [square, map] of byAttackedSquare) {
        yield [square, map.size];
      }
    })();
  }

  controlOfSquare(square: Square) {
    const map = this._squareControlByAttackedSquare.get(square);
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

  addAttacksForPiece(square: Square, squares: SquareControlObject[]): void {
    for (const squareControl of squares) {
      this._squareControlByAttackedSquare
        .get(squareControl.square)
        ?.set(squareControl.attacker.square, squareControl);
    }
    this._squareControlByPiece.set(square, squares);
  }

  addAttacks(
    square: Square,
    squares: SquareControlObject[],
    cache = true,
  ): void {
    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: UpdateType.PartialAdd,
        square,
        squares,
      });
    }

    for (const squareControl of squares) {
      this._squareControlByAttackedSquare
        .get(squareControl.square)
        ?.set(squareControl.attacker.square, squareControl);
    }
    const existing = this._squareControlByPiece.get(square);
    if (!existing) {
      throw Error('there should be square control from this square');
    }
    existing.push(...squares);
  }

  removeAttacksForPiece(square: Square, cache = true): void {
    const squares = this._squareControlByPiece.get(square) ?? [];
    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: UpdateType.FullRemove,
        square,
        squares,
      });
    }

    for (const squareControl of squares) {
      const squareControlExists = this._squareControlByAttackedSquare
        .get(squareControl.square)
        ?.has(squareControl.attacker.square);
      if (!squareControlExists) {
        throw Error('cannot remove attack that does not exist');
      }

      this._squareControlByAttackedSquare
        .get(squareControl.square)
        ?.delete(squareControl.attacker.square);
    }
    this._squareControlByPiece.set(square, []);
  }

  removeAttacks(
    square: Square,
    squares: SquareControlObject[],
    cache = true,
  ): void {
    const existing = this._squareControlByPiece.get(square);
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

    const squaresToRemove = squares.map(
      (squareControl) => squareControl.square,
    );

    for (const squareControl of squares) {
      const squareControlExists = this._squareControlByAttackedSquare
        .get(squareControl.square)
        ?.has(squareControl.attacker.square);
      if (!squareControlExists) {
        throw Error('cannot remove attack that does not exist');
      }

      this._squareControlByAttackedSquare
        .get(squareControl.square)
        ?.delete(squareControl.attacker.square);
    }

    for (let i = existing.length - 1; i >= 0; i--) {
      const control = existing[i];
      if (squaresToRemove.includes(control.square)) {
        existing.splice(i, 1);
      }
    }
  }
}
