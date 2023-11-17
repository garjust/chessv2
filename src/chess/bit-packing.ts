import { Color, PieceType, Square } from './types';

export const COLOR_MASK = 0b1;
export const PIECE_MASK = 0b1110;
export const FROM_MASK = 0b1111110000;
export const TO_MASK = 0b1111110000000000;

export const PIECE_SHIFT = 1;
export const FROM_SHIFT = 4;
export const TO_SHIFT = 10;

export const moveInt = (
  color: Color,
  pieceType: PieceType,
  from: Square,
  to: Square,
): number =>
  color | (pieceType << PIECE_SHIFT) | (from << FROM_SHIFT) | (to << TO_SHIFT);

export const unpackMove = (
  move: number,
): { color: Color; pieceType: PieceType; from: Square; to: Square } => ({
  color: move & COLOR_MASK,
  pieceType: (move & PIECE_MASK) >>> PIECE_SHIFT,
  from: (move & FROM_MASK) >>> FROM_SHIFT,
  to: (move & TO_MASK) >>> TO_SHIFT,
});
