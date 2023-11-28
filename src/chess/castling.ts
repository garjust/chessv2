import { CastlingAvailability, Color, Square } from './types';

const enum CastlingShift {
  WhiteKingside = 0,
  WhiteQueenside = WhiteKingside + 1,
  BlackKingside = WhiteQueenside + 1,
  BlackQueenside = BlackKingside + 1,
}

export const enum CastlingMask {
  WhiteKingside = 1 << CastlingShift.WhiteKingside,
  WhiteQueenside = 1 << CastlingShift.WhiteQueenside,
  BlackKingside = 1 << CastlingShift.BlackKingside,
  BlackQueenside = 1 << CastlingShift.BlackQueenside,
}

export const CASTLING_AVAILABILITY_ENABLED: CastlingAvailability = 0b1111;
export const CASTLING_AVAILABILITY_BLOCKED: CastlingAvailability = 0b0000;

export const ROOK_STARTING_SQUARES = {
  [Color.White]: {
    queenside: 0 as Square,
    kingside: 7 as Square,
  },
  [Color.Black]: {
    queenside: 56 as Square,
    kingside: 63 as Square,
  },
} as const;
