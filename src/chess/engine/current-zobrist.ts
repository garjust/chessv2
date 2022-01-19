import { makeNumbers } from '../lib/zobrist/numbers-32bit';
import { StatefulHash } from '../lib/zobrist/stateful-hash';
import { CastlingSide, Color, Piece, Position, Square } from '../types';
import { ZobristKey } from './types';

export default class CurrentZobrist {
  readonly _hashX: StatefulHash;
  readonly _hashY: StatefulHash;

  constructor(position: Position) {
    this._hashX = new StatefulHash(position, makeNumbers());
    this._hashY = new StatefulHash(position, makeNumbers());
  }

  set key(value: ZobristKey) {
    this._hashX.hash = value[0];
    this._hashY.hash = value[1];
  }

  get key(): ZobristKey {
    return [this._hashX.hash, this._hashY.hash];
  }

  updateSquareOccupancy(square: Square, piece: Piece): void {
    this._hashX.updateSquareOccupancy(square, piece);
    this._hashY.updateSquareOccupancy(square, piece);
  }

  updateTurn(): void {
    this._hashX.updateTurn();
    this._hashY.updateTurn();
  }

  updateCastling(color: Color, side: CastlingSide): void {
    this._hashX.updateCastling(color, side);
    this._hashY.updateCastling(color, side);
  }
}
