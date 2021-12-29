import { SquareBitmask, ZERO } from './bitboard-def';
import { Color, PieceType, Position, Square, SquareLabel } from '../types';
import { labelToSquare, squareLabel } from '../utils';

export type Bitboard = bigint;

export const board = (
  position: Position,
  { pieceType, color }: { pieceType?: PieceType; color?: Color }
): bigint => {
  let n = ZERO;

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

export const toSquares = (bitboard: Bitboard): Square[] =>
  Object.entries(SquareBitmask).reduce((squares, [label, long]) => {
    if ((bitboard & long) === long) {
      squares.push(labelToSquare(label as SquareLabel));
    }

    return squares;
  }, [] as Square[]);

export const fromSquares = (squares: Square[]): Bitboard =>
  squares.reduce(
    (n, square) => n | SquareBitmask[squareLabel(square)],
    BigInt(0b0)
  );
