import { makeNumbers } from '../lib/zobrist/numbers-32bit';
import { StatefulHash } from '../lib/zobrist/stateful-hash';
import { CastlingSide, Color, Piece, Position, Square } from '../types';

export default class TranspositionTable<T> {
  _hashX: StatefulHash;
  _hashY: StatefulHash;
  _map;

  constructor(position: Position) {
    this._map = new Map<number, Map<number, T>>();
    this._hashX = new StatefulHash(position, makeNumbers());
    this._hashY = new StatefulHash(position, makeNumbers());
  }

  set(value: T) {
    if (!this._map.has(this._hashX.hash)) {
      this._map.set(this._hashX.hash, new Map());
    }
    this._map.get(this._hashX.hash)?.set(this._hashY.hash, value);
  }

  get() {
    return this._map.get(this._hashX.hash)?.get(this._hashY.hash);
  }

  updateSquareOccupancy(square: Square, piece: Piece) {
    this._hashX.updateSquareOccupancy(square, piece);
    this._hashY.updateSquareOccupancy(square, piece);
  }

  updateTurn(color: Color) {
    this._hashX.updateTurn(color);
    this._hashY.updateTurn(color);
  }

  updateCastling(color: Color, side: CastlingSide) {
    this._hashX.updateCastling(color, side);
    this._hashY.updateCastling(color, side);
  }
}
