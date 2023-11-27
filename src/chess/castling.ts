import { CastlingAvailability, Color, Square } from './types';

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

export const CASTLING_AVAILABILITY_BLOCKED = Object.freeze({
  [Color.White]: {
    kingside: false,
    queenside: false,
  },
  [Color.Black]: {
    kingside: false,
    queenside: false,
  },
});

export const copyCastlingAvailability = (
  castlingAvailability: CastlingAvailability,
): CastlingAvailability => ({
  [Color.White]: {
    kingside: castlingAvailability[Color.White].kingside,
    queenside: castlingAvailability[Color.White].queenside,
  },
  [Color.Black]: {
    kingside: castlingAvailability[Color.Black].kingside,
    queenside: castlingAvailability[Color.Black].queenside,
  },
});
