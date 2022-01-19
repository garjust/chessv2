import { CastlingSide, Color, Piece, Position, Square } from '../../types';
import { hash, hash64 } from './hash';
import { Type, ZobristNumbers } from './types';

export class StatefulHash {
  _zobristNumbers: ZobristNumbers<number>;
  _hash: number;

  constructor(position: Position, zobristNumbers: ZobristNumbers<number>) {
    this._zobristNumbers = zobristNumbers;
    this._hash = hash(position, this._zobristNumbers);
  }

  get hash(): number {
    return this._hash;
  }

  set hash(value: Position | number) {
    if (typeof value === 'number') {
      this._hash = value;
    } else {
      this._hash = hash(value, this._zobristNumbers);
    }
  }

  updateSquareOccupancy(square: Square, piece: Piece) {
    this._hash ^=
      this._zobristNumbers[Type.PieceSquare][piece.color][square][piece.type];
  }

  updateTurn() {
    this._hash ^= this._zobristNumbers[Type.Turn];
  }

  updateCastling(color: Color, side: CastlingSide) {
    this._hash ^= this._zobristNumbers[Type.CastlingAvailability][color][side];
  }
}

export class StatefulHash64 {
  _zobristNumbers: ZobristNumbers<bigint>;
  _hash: bigint;

  constructor(position: Position, zobristNumbers: ZobristNumbers<bigint>) {
    this._zobristNumbers = zobristNumbers;
    this._hash = hash64(position, this._zobristNumbers);
  }

  get hash() {
    return this._hash;
  }

  updateSquareOccupancy(square: Square, piece: Piece) {
    this._hash ^=
      this._zobristNumbers[Type.PieceSquare][piece.color][square][piece.type];
  }

  updateTurn() {
    this._hash ^= this._zobristNumbers[Type.Turn];
  }

  updateCastling(color: Color, side: CastlingSide) {
    this._hash ^= this._zobristNumbers[Type.CastlingAvailability][color][side];
  }
}
