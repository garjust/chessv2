/* tslint:disable */
/* eslint-disable */
/**
* A square on the chess board.
*/
export enum Square {
  A1 = 0,
  A2 = 1,
  A3 = 2,
  A4 = 3,
  A5 = 4,
  A6 = 5,
  A7 = 6,
  A8 = 7,
  B1 = 8,
  B2 = 9,
  B3 = 10,
  B4 = 11,
  B5 = 12,
  B6 = 13,
  B7 = 14,
  B8 = 15,
  C1 = 16,
  C2 = 17,
  C3 = 18,
  C4 = 19,
  C5 = 20,
  C6 = 21,
  C7 = 22,
  C8 = 23,
  D1 = 24,
  D2 = 25,
  D3 = 26,
  D4 = 27,
  D5 = 28,
  D6 = 29,
  D7 = 30,
  D8 = 31,
  E1 = 32,
  E2 = 33,
  E3 = 34,
  E4 = 35,
  E5 = 36,
  E6 = 37,
  E7 = 38,
  E8 = 39,
  F1 = 40,
  F2 = 41,
  F3 = 42,
  F4 = 43,
  F5 = 44,
  F6 = 45,
  F7 = 46,
  F8 = 47,
  G1 = 48,
  G2 = 49,
  G3 = 50,
  G4 = 51,
  G5 = 52,
  G6 = 53,
  G7 = 54,
  G8 = 55,
  H1 = 56,
  H2 = 57,
  H3 = 58,
  H4 = 59,
  H5 = 60,
  H6 = 61,
  H7 = 62,
  H8 = 63,
}
/**
* Color of a square or piece.
*/
export enum Color {
  White = 0,
  Black = 1,
}
/**
* A file on the chess board.
*/
export enum File {
  _A = 0,
  _B = 1,
  _C = 2,
  _D = 3,
  _E = 4,
  _F = 5,
  _G = 6,
  _H = 7,
}
/**
* Type of piece. Real pieces have values 1..6.
*/
export enum PieceType {
  Null = 0,
  Pawn = 1,
  Knight = 2,
  Bishop = 3,
  Rook = 4,
  Queen = 5,
  King = 6,
/**
* Represents a piece than has the movement of every other piece.
*/
  Super = 7,
}
/**
* A rank on the chess board.
*/
export enum Rank {
  _1 = 0,
  _2 = 1,
  _3 = 2,
  _4 = 3,
  _5 = 4,
  _6 = 5,
  _7 = 6,
  _8 = 7,
}
/**
*/
export enum CastlingState {
  None = 0,
  All = 15,
  White_OO = 1,
  White_OOO = 2,
  Black_OO = 4,
  Black_OOO = 8,
  White = 3,
  Black = 12,
  Kingside = 5,
  Queenside = 10,
  White_OO__Black_OOO = 9,
  White_OO__Black = 13,
  White_OOO__Black_OO = 6,
  White_OOO__Black = 14,
  White__Black_OO = 7,
  White__Black_OOO = 11,
}
/**
*/
export class ManagedKey {
  free(): void;
/**
* @param {bigint} seed
*/
  constructor(seed: bigint);
/**
*/
  pushKey(): void;
/**
*/
  popKey(): void;
/**
*/
  updateTurn(): void;
/**
* @param {File} file
*/
  updateEnPassantFile(file: File): void;
/**
* @param {CastlingState} castling_state
*/
  updateCastlingState(castling_state: CastlingState): void;
/**
* @param {Color} color
* @param {PieceType} piece_type
* @param {Square} square
*/
  updateSquareOccupancy(color: Color, piece_type: PieceType, square: Square): void;
/**
*/
  readonly key: bigint;
}
/**
*/
export class Stats {
  free(): void;
/**
*/
  readonly hits: number;
/**
*/
  readonly miss: number;
/**
*/
  readonly percentFull: number;
/**
*/
  readonly size: number;
/**
*/
  readonly type1: number;
}
/**
*/
export class TTable {
  free(): void;
/**
* @param {bigint} seed
*/
  constructor(seed: bigint);
/**
* @returns {Stats}
*/
  stats(): Stats;
/**
* @returns {Uint8Array}
*/
  get(): Uint8Array;
/**
* @returns {number}
*/
  getPtr(): number;
/**
* @returns {bigint}
*/
  getAsU64(): bigint;
/**
* @param {Uint8Array} entry
*/
  set(entry: Uint8Array): void;
/**
*/
  pushKey(): void;
/**
*/
  popKey(): void;
/**
*/
  updateTurn(): void;
/**
* @param {File} file
*/
  updateEnPassantFile(file: File): void;
/**
* @param {CastlingState} castling_state
*/
  updateCastlingState(castling_state: CastlingState): void;
/**
* @param {Color} color
* @param {PieceType} piece_type
* @param {Square} square
*/
  updateSquareOccupancy(color: Color, piece_type: PieceType, square: Square): void;
/**
*/
  readonly currentKey: TTable;
/**
*/
  readonly key: bigint;
}
