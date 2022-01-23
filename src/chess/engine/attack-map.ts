import equal from 'fast-deep-equal/es6';
import Engine from '.';
import {
  Color,
  Square,
  SquareControlObject,
  Position as ExternalPosition,
} from '../types';
import { forPiece } from './piece-movement-control';

enum ChangeType {
  FullRemove,
  PartialRemove,
  PartialAdd,
}

type SquareControlChange = {
  type: ChangeType;
  square: Square;
  squares: SquareControlObject[];
};

const EMPTY_ATTACKS: [number, number][] = Array(64)
  .fill(0)
  .map((v, i) => [i, v]);

export default class AttackMap {
  // Store the number of pieces attacking a particular square.
  _countMap = new Map<Square, number>(EMPTY_ATTACKS);
  // Store all squares controlled by the piece residing in
  // the key square.
  _squareControlByPiece = new Map<Square, SquareControlObject[]>();

  _updatesStack: SquareControlChange[][] = [];

  constructor(position: ExternalPosition, color: Color) {
    for (const [square, piece] of position.pieces) {
      if (piece.color !== color) {
        continue;
      }

      const squareControl = forPiece(piece, position.pieces, square);
      this.addAttacksForPiece(square, squareControl);
    }
  }

  isAttacked(square: Square): boolean {
    return (this._countMap.get(square) ?? 0) > 0;
  }

  controlForPiece(square: number): SquareControlObject[] {
    return this._squareControlByPiece.get(square) ?? [];
  }

  attackEntries(): IterableIterator<[number, number]> {
    return this._countMap.entries();
  }

  startChangeset(): void {
    this._updatesStack.push([]);
  }

  undoChangeset(): void {
    const removals = this._updatesStack.pop() ?? [];
    for (const change of removals) {
      switch (change.type) {
        case ChangeType.FullRemove:
          this.removeAttacksForPiece(change.square, false);
          this.addAttacksForPiece(change.square, change.squares);
          break;
        case ChangeType.PartialRemove:
          this.addAttacks(change.square, change.squares, false);
          break;
        case ChangeType.PartialAdd:
          this.removeAttacks(change.square, change.squares, false);
          break;
      }
    }
  }

  addAttacksForPiece(square: Square, squares: SquareControlObject[]): void {
    for (const squareControl of squares) {
      this._countMap.set(
        squareControl.square,
        (this._countMap.get(squareControl.square) ?? 0) + 1
      );
    }
    this._squareControlByPiece.set(square, squares);
  }

  addAttacks(
    square: Square,
    squares: SquareControlObject[],
    cache = true
  ): void {
    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: ChangeType.PartialAdd,
        square,
        squares,
      });
    }

    for (const squareControl of squares) {
      this._countMap.set(
        squareControl.square,
        (this._countMap.get(squareControl.square) ?? 0) + 1
      );
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
        type: ChangeType.FullRemove,
        square,
        squares,
      });
    }

    for (const squareControl of squares) {
      const count = this._countMap.get(squareControl.square);
      if (!count || count === 0) {
        throw Error('cannot remove attack that does not exist');
      }
      this._countMap.set(squareControl.square, count - 1);
    }
    this._squareControlByPiece.set(square, []);
  }

  removeAttacks(
    square: Square,
    squares: SquareControlObject[],
    cache = true
  ): void {
    const existing = this._squareControlByPiece.get(square);
    if (!existing) {
      throw Error('there should be square control from this square');
    }

    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: ChangeType.PartialRemove,
        square,
        squares,
      });
    }

    const squaresToRemove = squares.map(
      (squareControl) => squareControl.square
    );

    for (const squareControl of squares) {
      const count = this._countMap.get(squareControl.square);
      if (!count || count === 0) {
        throw Error('cannot remove attack that does not exist');
      }

      this._countMap.set(squareControl.square, count - 1);
    }

    for (let i = existing.length - 1; i >= 0; i--) {
      const control = existing[i];
      if (squaresToRemove.includes(control.square)) {
        existing.splice(i, 1);
      }
    }
  }
}

export const verify = (map: AttackMap, engine: Engine, color: Color) => {
  const computed = new AttackMap(engine._position, color);

  // if (!equal(map._squareControlByPiece, computed._squareControlByPiece)) {
  //   console.log('control map is out of sync');
  // }
  if (!equal(map._countMap, computed._countMap)) {
    console.log('attack count map is out of sync');
  }
};
