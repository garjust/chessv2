import { Color, Move, Piece, PieceType, Position, Square } from './types';
import { squareEquals, squaresInclude } from './utils';

const pruneIllegalSquares = (...squares: Square[]): Square[] =>
  squares.filter(
    ({ rank, file }) => rank >= 0 && rank < 8 && file >= 0 && file < 8
  );

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
  piece.color === Color.White ? square.rank === 1 : square.rank === 6;

const isTwoSquarePawnMove = (move: Move): boolean =>
  Math.abs(move.from.rank - move.to.rank) == 2;

const enPassantSquareFromMove = (move: Move): Square =>
  move.from.rank === 1 ? up(move.from) : down(move.from);

const pawnMoves = (
  position: Position,
  piece: Piece,
  square: Square
): Square[] => {
  const squares: Square[] = [];
  const opponentColor = piece.color === Color.White ? Color.Black : Color.White;
  const advanceFn = piece.color === Color.White ? up : down;

  // if (piece.color === Color.White) {
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

export const findSquaresForMove = (
  position: Position,
  square: Square
): Square[] => {
  const piece = position.pieces.get(square);
  if (!piece) {
    throw Error('no piece to find moves for');
  }

  const squares: Square[] = [];

  if (piece.type === PieceType.Pawn) {
    squares.push(...pawnMoves(position, piece, square));
  }

  return pruneIllegalSquares(...squares);
};

export const applyMove = (position: Position, move: Move): Position => {
  const piece = position.pieces.get(move.from);

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
  let isCapture = position.pieces.delete(move.from);
  position.pieces.set(move.to, piece);

  if (
    piece.type === PieceType.Pawn &&
    squareEquals(position.enPassantSquare, move.to)
  ) {
    // This is an en passant capture
    isCapture = true;
    if (piece.color === Color.White) {
      position.pieces.delete(down(move.to));
    } else {
      position.pieces.delete(up(move.to));
    }
  }

  // Update other state in the position
  position.enPassantSquare = null;
  if (piece.type === PieceType.Pawn && isTwoSquarePawnMove(move)) {
    position.enPassantSquare = enPassantSquareFromMove(move);
  }

  if (position.turn === Color.Black) {
    position.fullMoveCount++;
  }
  if (piece.type !== PieceType.Pawn && !isCapture) {
    position.halfMoveCount++;
  }

  position.turn = position.turn === Color.White ? Color.Black : Color.White;

  return position;
};
