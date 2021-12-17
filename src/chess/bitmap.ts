import { SquareBitmask } from './bitmap-def';
import { Color, PieceType, Position } from './types';
import { squareLabel } from './utils';

export const board = (
  position: Position,
  { pieceType, color }: { pieceType?: PieceType; color?: Color }
): bigint => {
  let n = BigInt(0b0);

  for (const [square, piece] of position.pieces.entries()) {
    if (
      (color && piece.color !== color) ||
      (pieceType && piece.type !== pieceType)
    ) {
      continue;
    }

    n = n | SquareBitmask[squareLabel(square)];
  }

  return n;
};
