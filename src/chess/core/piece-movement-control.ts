import { Color, Piece, PieceType, Square, SquareControlObject } from '../types';
import { isLegalSquare } from '../utils';
import {
  BISHOP_RAYS,
  KING_MOVES,
  KNIGHT_MOVES,
  QUEEN_RAYS,
  ROOK_RAYS,
} from './lookup';
import { down, left, right, up, rayControlScanner } from './move-utils';

export const pawnMoves = (
  piece: Piece,
  from: Square,
): SquareControlObject[] => {
  const squares: SquareControlObject[] = [];
  const advanceFn = piece.color === Color.White ? up : down;

  const leftCaptureSquare = advanceFn(left(from));
  const rightCaptureSquare = advanceFn(right(from));

  // Pawn captures diagonally.
  if (isLegalSquare(leftCaptureSquare) && leftCaptureSquare % 8 !== 7) {
    squares.push({
      piece,
      from,
      to: leftCaptureSquare,
      slideSquares: [],
    });
  }
  if (isLegalSquare(rightCaptureSquare) && rightCaptureSquare % 8 !== 0) {
    squares.push({
      piece,
      from,
      to: rightCaptureSquare,
      slideSquares: [],
    });
  }

  return squares;
};

export const knightMoves = (
  from: Square,
  piece: Piece,
): SquareControlObject[] =>
  KNIGHT_MOVES[from].map((to) => ({
    piece,
    from,
    to,
    slideSquares: [],
  }));

export const kingMoves = (
  from: Square,
  piece: Piece,
): SquareControlObject[] => {
  return KING_MOVES[from].map((to) => ({
    piece,
    from,
    to,
    slideSquares: [],
  }));
};

export const bishopMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
): SquareControlObject[] =>
  BISHOP_RAYS[from].flatMap((ray) =>
    rayControlScanner(pieces, { square: from, piece }, ray),
  );

export const rookMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
): SquareControlObject[] =>
  ROOK_RAYS[from].flatMap((ray) =>
    rayControlScanner(pieces, { square: from, piece }, ray),
  );

export const queenMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
): SquareControlObject[] =>
  QUEEN_RAYS[from].flatMap((ray) =>
    rayControlScanner(pieces, { square: from, piece }, ray),
  );

export const forPiece = (
  piece: Piece,
  pieces: Map<Square, Piece>,
  square: Square,
): SquareControlObject[] => {
  switch (piece.type) {
    case PieceType.Bishop:
      return bishopMoves(pieces, piece, square);
    case PieceType.King:
      return kingMoves(square, piece);
    case PieceType.Knight:
      return knightMoves(square, piece);
    case PieceType.Pawn:
      return pawnMoves(piece, square);
    case PieceType.Queen:
      return queenMoves(pieces, piece, square);
    case PieceType.Rook:
      return rookMoves(pieces, piece, square);
  }
};
