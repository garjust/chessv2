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

  set(value: T): void {
    if (!this._map.has(this._hashX.hash)) {
      this._map.set(this._hashX.hash, new Map());
    }
    this._map.get(this._hashX.hash)?.set(this._hashY.hash, value);
  }

  get(): T | undefined {
    return this._map.get(this._hashX.hash)?.get(this._hashY.hash);
  }

  newHash(position: Position) {
    this._hashX.hash = position;
    this._hashY.hash = position;
  }

  get currentHash(): [number, number] {
    return [this._hashX.hash, this._hashY.hash];
  }

  setCurrentHash(x: number, y: number): void {
    this._hashX.hash = x;
    this._hashY.hash = y;
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
