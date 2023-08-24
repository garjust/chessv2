import { SquareBitmask, ZERO } from './bitboard-def';
import { Color, PieceType, Position, Square } from '../types';

export type Bitboard = bigint;

export const board = (
  position: Position,
  { pieceType, color }: { pieceType?: PieceType; color?: Color },
): bigint => {
  let n = ZERO;

  for (const [square, piece] of position.pieces.entries()) {
    if (
      (color && piece.color !== color) ||
      (pieceType && piece.type !== pieceType)
    ) {
      continue;
    }

    n = n | SquareBitmask[square];
  }

  return n;
};

export const toSquares = (bitboard: Bitboard): Square[] =>
  SquareBitmask.reduce((squares, long, square) => {
    if ((bitboard & long) === long) {
      squares.push(square);
    }

    return squares;
  }, [] as Square[]);

export const fromSquares = (squares: Square[]): Bitboard =>
  squares.reduce((n, square) => n | SquareBitmask[square], BigInt(0b0));
