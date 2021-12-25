import { Color, Move, Position, Square } from '../../types';
import { isLegalSquare, squareEquals } from '../../utils';

type MoveSquareFunction = (square: Square, n: number) => Square;

const identitySquare = (square: Square, n = 1): Square => ({ ...square });

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

// Assumes a move for a bishop, rook, or queen.

const unitMoveSquareFunction = ({ from, to }: Move): MoveSquareFunction => {
  let rankFn: MoveSquareFunction = identitySquare;
  let fileFn: MoveSquareFunction = identitySquare;

  //   // diagonal?
  //   // cardinal?
  if (from.file - to.file < 0) {
    fileFn = right;
  } else if (from.file - to.file > 0) {
    fileFn = left;
  }

  if (from.rank - to.rank < 0) {
    rankFn = up;
  } else if (from.rank - to.rank > 0) {
    rankFn = down;
  }

  return (square: Square, n = 1) => rankFn(fileFn(square, n), n);
};

// Assumes a sliding move
export const squaresBetweenMove = (move: Move): Square[] => {
  const squares: Square[] = [];

  const scanFn = unitMoveSquareFunction(move);
  let scannedSquare = scanFn(move.from, 1);

  while (!squareEquals(scannedSquare, move.to)) {
    squares.push(scannedSquare);
    scannedSquare = scanFn(scannedSquare, 1);

    if (!isLegalSquare(scannedSquare)) {
      throw Error('failed to find squares between move, went out of bounds');
    }
  }

  return squares;
};
