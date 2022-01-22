import {
  Color,
  Square,
  SquareControlObject,
  Position as ExternalPosition,
} from '../types';
import { forPiece } from './piece-movement-control';

type SquareControlChangeset = {
  square: Square;
  squares: SquareControlObject[];
};

export default class AttackMap {
  // Store the number of pieces attacking a particular square.
  _countMap = new Map<Square, number>();
  // Store all squares controlled by the piece residing in
  // the key square.
  _squareControlByPiece = new Map<Square, SquareControlObject[]>();

  _updatesStack: SquareControlChangeset[][] = [];

  constructor(position: ExternalPosition, color: Color) {
    for (const [square, piece] of position.pieces) {
      if (piece.color !== color) {
        continue;
      }

      const squareControl = forPiece(piece, position.pieces, square);
      this.addAttacks(square, squareControl);
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
      this.removeAttacks(change.square, false);
      this.addAttacks(change.square, change.squares);
    }
  }

  addAttacks(square: Square, squares: SquareControlObject[]): void {
    for (const squareControl of squares) {
      this._countMap.set(
        squareControl.square,
        (this._countMap.get(squareControl.square) ?? 0) + 1
      );
    }
    this._squareControlByPiece.set(square, squares);
  }

  removeAttacks(square: Square, cache = true): void {
    const squares = this._squareControlByPiece.get(square) ?? [];
    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        square,
        squares,
      });
    }

    for (const squareControl of squares) {
      this._countMap.set(
        squareControl.square,
        (this._countMap.get(squareControl.square) ?? 0) - 1
      );
    }
    this._squareControlByPiece.set(square, []);
  }
}
