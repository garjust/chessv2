import { Piece, Position, Square } from '../types';
import { isLegalSquare } from '../utils';

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

export const squareScanner = (position: Position, piece: Piece) => {
  const scan = (
    squares: Square[],
    scanFn: (square: Square) => Square
  ): Square[] => {
    const next = scanFn(squares[squares.length - 1]);
    if (!isLegalSquare(next)) {
      return squares;
    }

    const nextPiece = position.pieces.get(next);
    if (nextPiece) {
      if (nextPiece.color === piece.color) {
        // friend!
        return squares;
      } else {
        // foe!
        return [...squares, next];
      }
    }

    // empty! keep scanning!
    return scan([...squares, next], scanFn);
  };

  return scan;
};
