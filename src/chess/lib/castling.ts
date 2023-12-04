import { CastlingState, Color } from '../types';

export const ROOK_STARTING_SQUARES = {
  [Color.White]: {
    queenside: 0,
    kingside: 7,
  },
  [Color.Black]: {
    queenside: 56,
    kingside: 63,
  },
} as const;

export const kingsideOff = (x: CastlingState, color: Color) =>
  color === Color.White
    ? x & ~CastlingState.White_OO
    : x & ~CastlingState.Black_OO;
export const queensideOff = (x: CastlingState, color: Color) =>
  color === Color.White
    ? x & ~CastlingState.White_OOO
    : x & ~CastlingState.Black_OOO;
export const castlingOff = (x: CastlingState, color: Color) =>
  color === Color.White ? x & ~CastlingState.White : x & ~CastlingState.Black;

export const isKingsideOn = (x: CastlingState, color: Color) =>
  color === Color.White
    ? (x & CastlingState.White_OO) > 0
    : (x & CastlingState.Black_OO) > 0;
export const isQueensideOn = (x: CastlingState, color: Color) =>
  color === Color.White
    ? (x & CastlingState.White_OOO) > 0
    : (x & CastlingState.Black_OOO) > 0;
