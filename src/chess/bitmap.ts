import { SquareBitmask } from './bitmap-def';
import { Color, Position } from './types';
import { squareLabel } from './utils';

export const pieceMap = (position: Position, color?: Color): bigint => {
  let n = BigInt(0b0);

  for (const [square, piece] of position.pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }

    n = n | SquareBitmask[squareLabel(square)];
  }

  return n;
};
