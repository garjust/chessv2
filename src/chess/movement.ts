import { Color, Move, Piece, PieceType, Position, Square } from './types';
import {
  isLegalSquare,
  squareEquals,
  SquareMap,
  squaresInclude,
} from './utils';

const WHITE_PAWN_STARTING_RANK = 1;
const BLACK_PAWN_STARTING_RANK = 6;

const up = (square: Square, n = 1): Square => ({
  rank: square.rank + n,
  file: square.file,
});

const down = (square: Square, n = 1): Square => ({
  rank: square.rank - n,
  file: square.file,
});

const left = (square: Square, n = 1): Square => ({
  rank: square.rank,
  file: square.file - n,
});

const right = (square: Square, n = 1): Square => ({
  rank: square.rank,
  file: square.file + n,
});

const upLeft = (square: Square, n = 1): Square => up(left(square, n), n);
const upRight = (square: Square, n = 1): Square => up(right(square, n), n);
const downLeft = (square: Square, n = 1): Square => down(left(square, n), n);
const downRight = (square: Square, n = 1): Square => down(right(square, n), n);

const isStartPositionPawn = (piece: Piece, square: Square): boolean =>
  piece.color === Color.White
    ? square.rank === WHITE_PAWN_STARTING_RANK
    : square.rank === BLACK_PAWN_STARTING_RANK;

const isTwoSquarePawnMove = (move: Move): boolean =>
  Math.abs(move.from.rank - move.to.rank) == 2;

const enPassantSquareFromMove = (piece: Piece, move: Move): Square | null => {
  if (piece.type === PieceType.Pawn && isTwoSquarePawnMove(move)) {
    return move.from.rank === 1 ? up(move.from) : down(move.from);
  } else {
    return null;
  }
};

const pawnMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];
  const opponentColor = piece.color === Color.White ? Color.Black : Color.White;
  const advanceFn = piece.color === Color.White ? up : down;

  // space above the pawn.
  if (!position.pieces.get(advanceFn(square))) {
    squares.push(advanceFn(square));

    // space two squares above the pawn and it is in the starting position.
    if (
      !position.pieces.get(advanceFn(square, 2)) &&
      isStartPositionPawn(piece, square)
    ) {
      squares.push(advanceFn(square, 2));
    }
  }

  if (
    position.pieces.get(advanceFn(left(square)))?.color === opponentColor ||
    squareEquals(position.enPassantSquare, advanceFn(left(square)))
  ) {
    squares.push(advanceFn(left(square)));
  }
  if (
    position.pieces.get(advanceFn(right(square)))?.color === opponentColor ||
    squareEquals(position.enPassantSquare, advanceFn(right(square)))
  ) {
    squares.push(advanceFn(right(square)));
  }

  return squares;
};

const squareScanner = (position: Position, piece: Piece) => {
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

    return scan([...squares, next], scanFn);
  };

  return scan;
};

const bishopMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [upLeft, upRight, downLeft, downRight].forEach((scanFn) => {
    squares.push(...squareScanner(position, piece)([square], scanFn).slice(1));
  });

  return squares;
};

const knightMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [
    up(left(square), 2),
    up(right(square), 2),
    left(up(square), 2),
    left(down(square), 2),
    down(left(square), 2),
    down(right(square), 2),
    right(up(square), 2),
    right(down(square), 2),
  ]
    .filter(
      (candidateSquare) =>
        position.pieces.get(candidateSquare)?.color !== piece.color
    )
    .forEach((candidateSquare) => squares.push(candidateSquare));

  return squares;
};

const kingMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [
    up(square),
    left(square),
    right(square),
    down(square),
    upLeft(square),
    upRight(square),
    downLeft(square),
    downRight(square),
  ]
    .filter(
      (candidateSquare) =>
        position.pieces.get(candidateSquare)?.color !== piece.color
    )
    .forEach((candidateSquare) => squares.push(candidateSquare));

  return squares;
};

const queenMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [up, right, left, down, upLeft, upRight, downLeft, downRight].forEach(
    (scanFn) => {
      squares.push(
        ...squareScanner(position, piece)([square], scanFn).slice(1)
      );
    }
  );

  return squares;
};

const rookMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];

  [up, right, left, down].forEach((scanFn) => {
    squares.push(...squareScanner(position, piece)([square], scanFn).slice(1));
  });

  return squares;
};

export const findSquaresForMove = (
  position: Position,
  square: Square
): Square[] => {
  const piece = position.pieces.get(square);
  if (!piece) {
    throw Error('no piece to find moves for');
  }

  const squares: Square[] = [];

  switch (piece.type) {
    case PieceType.Bishop:
      squares.push(...bishopMoves(position, piece, square));
      break;
    case PieceType.King:
      squares.push(...kingMoves(position, piece, square));
      break;
    case PieceType.Knight:
      squares.push(...knightMoves(position, piece, square));
      break;
    case PieceType.Pawn:
      squares.push(...pawnMoves(position, piece, square));
      break;
    case PieceType.Queen:
      squares.push(...queenMoves(position, piece, square));
      break;
    case PieceType.Rook:
      squares.push(...rookMoves(position, piece, square));
      break;
  }

  return squares.filter(isLegalSquare);
};

export const applyMove = (position: Position, move: Move): Position => {
  const pieces = new SquareMap<Piece>();
  for (const [key, value] of position.pieces) {
    pieces.set(key, value);
  }

  const piece = pieces.get(move.from);

  if (!piece) {
    throw Error('no piece to move');
  }
  if (piece.color !== position.turn) {
    throw Error('cannot move piece for other color');
  }

  const legalSquares = findSquaresForMove(position, move.from);
  if (!squaresInclude(legalSquares, move.to)) {
    throw Error('illegal move!');
  }

  // Execute the move
  let isCapture = pieces.delete(move.from);
  pieces.set(move.to, piece);

  if (
    piece.type === PieceType.Pawn &&
    squareEquals(position.enPassantSquare, move.to)
  ) {
    // This is an en passant capture
    isCapture = true;
    if (piece.color === Color.White) {
      pieces.delete(down(move.to));
    } else {
      pieces.delete(up(move.to));
    }
  }

  return Object.freeze({
    pieces,
    turn: position.turn === Color.White ? Color.Black : Color.White,
    castlingAvailability: position.castlingAvailability,
    enPassantSquare: enPassantSquareFromMove(piece, move),
    halfMoveCount:
      piece.type !== PieceType.Pawn && !isCapture
        ? position.halfMoveCount + 1
        : 0,
    fullMoveCount:
      position.turn === Color.Black
        ? position.fullMoveCount + 1
        : position.fullMoveCount,
  });
};
