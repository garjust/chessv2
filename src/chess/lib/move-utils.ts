import { Color, Piece, Position, Square } from '../types';
import {
  isLegalSquare,
  BLACK_PAWN_STARTING_RANK,
  WHITE_PAWN_STARTING_RANK,
} from '../utils';

export const isStartPositionPawn = (piece: Piece, square: Square): boolean =>
  piece.color === Color.White
    ? square.rank === WHITE_PAWN_STARTING_RANK
    : square.rank === BLACK_PAWN_STARTING_RANK;

export const isPromotionPositionPawn = (
  piece: Piece,
  square: Square
): boolean =>
  piece.color === Color.White
    ? square.rank === BLACK_PAWN_STARTING_RANK
    : square.rank === WHITE_PAWN_STARTING_RANK;

export const up = (square: Square, n = 1): Square => ({
  rank: square.rank + n,
  file: square.file,
});
export const down = (square: Square, n = 1): Square => ({
  rank: square.rank - n,
  file: square.file,
});
export const left = (square: Square, n = 1): Square => ({
  rank: square.rank,
  file: square.file - n,
});
export const right = (square: Square, n = 1): Square => ({
  rank: square.rank,
  file: square.file + n,
});

export const upLeft = (square: Square, n = 1): Square => up(left(square, n), n);
export const upRight = (square: Square, n = 1): Square =>
  up(right(square, n), n);
export const downLeft = (square: Square, n = 1): Square =>
  down(left(square, n), n);
export const downRight = (square: Square, n = 1): Square =>
  down(right(square, n), n);

const scan = (
  position: Position,
  friendlyColor: Color,
  scanFn: (square: Square) => Square,
  squares: Square[]
): Square[] => {
  const next = scanFn(squares[squares.length - 1]);
  if (!isLegalSquare(next)) {
    return squares;
  }

  const nextPiece = position.pieces.get(next);
  if (nextPiece) {
    if (nextPiece.color === friendlyColor) {
      // friend!
      return squares;
    } else {
      // foe!
      return [...squares, next];
    }
  }

  // empty! keep scanning!
  return scan(position, friendlyColor, scanFn, [...squares, next]);
};

export const squareScanner = (
  position: Position,
  square: Square,
  friendlyColor: Color,
  scanFn: (square: Square) => Square
): Square[] => {
  return scan(position, friendlyColor, scanFn, [square]).slice(1);
};
