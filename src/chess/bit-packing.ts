import { Color, PieceType, Square } from './types';

export const COLOR_MASK = 0b1;
export const COLOR_BITS = 1;
export const SQUARE_MASK = 0b111111;
export const SQUARE_BITS = 6;
export const PIECE_TYPE_MASK = 0b111;
export const PIECE_TYPE_BITS = 3;

export const PIECE_SHIFT = COLOR_BITS;
export const FROM_SHIFT = PIECE_SHIFT + PIECE_TYPE_BITS;
export const TO_SHIFT = FROM_SHIFT + SQUARE_BITS;
export const PROMOTION_SHIFT = TO_SHIFT + SQUARE_BITS;

const PIECE_MASK = PIECE_TYPE_MASK << PIECE_SHIFT;
const FROM_MASK = SQUARE_MASK << FROM_SHIFT;
const TO_MASK = SQUARE_MASK << TO_SHIFT;
const PROMOTION_MASK = PIECE_TYPE_MASK << PROMOTION_SHIFT;

type intMove = Brand<number, 'intMove'>;
type intPiece = Brand<number, 'intPiece'>;

export const moveInt = (
  color: Color,
  pieceType: PieceType,
  from: Square,
  to: Square,
  promotion?: PieceType,
): intMove =>
  (color |
    (pieceType << PIECE_SHIFT) |
    (from << FROM_SHIFT) |
    (to << TO_SHIFT) |
    ((promotion ?? 0) << PROMOTION_SHIFT)) as intMove;

export const unpackMove = (move: intMove) =>
  ({
    color: move & COLOR_MASK,
    pieceType: (move & PIECE_MASK) >>> PIECE_SHIFT,
    from: ((move & FROM_MASK) >>> FROM_SHIFT) as Square,
    to: ((move & TO_MASK) >>> TO_SHIFT) as Square,
    promotion:
      (move & PROMOTION_MASK) >>> PROMOTION_SHIFT !== 0
        ? (((move & PROMOTION_MASK) >>> PROMOTION_SHIFT) as PieceType)
        : null,
  }) as const;

export const pieceInt = (
  color: Color,
  pieceType: PieceType,
  square: Square,
): intPiece =>
  moveInt(color, pieceType, square, 0 as Square) as number as intPiece;
