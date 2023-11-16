import { Color, Piece, PieceType, Square, SquareControlObject } from '../types';
import { isLegalSquare } from '../utils';
import {
  BISHOP_LOOKUP,
  KING_LOOKUP,
  KNIGHT_LOOKUP,
  ROOK_LOOKUP,
} from './lookup-moves/move-lookup';
import { down, left, right, up, rayControlScanner } from './move-utils';

export const pawnMoves = (
  color: Color,
  from: Square,
): SquareControlObject[] => {
  const squares: SquareControlObject[] = [];
  const advanceFn = color === Color.White ? up : down;

  const leftCaptureSquare = advanceFn(left(from));
  const rightCaptureSquare = advanceFn(right(from));

  // Pawn captures diagonally.
  if (isLegalSquare(leftCaptureSquare) && leftCaptureSquare % 8 !== 7) {
    squares.push({
      attacker: { square: from, type: PieceType.Pawn },
      square: leftCaptureSquare,
      slideSquares: [],
    });
  }
  if (isLegalSquare(rightCaptureSquare) && rightCaptureSquare % 8 !== 0) {
    squares.push({
      attacker: { square: from, type: PieceType.Pawn },
      square: rightCaptureSquare,
      slideSquares: [],
    });
  }

  return squares;
};

export const knightMoves = (from: Square): SquareControlObject[] =>
  KNIGHT_LOOKUP[from].map((to) => ({
    attacker: { square: from, type: PieceType.Knight },
    square: to,
    slideSquares: [],
  }));

export const kingMoves = (from: Square): SquareControlObject[] => {
  return KING_LOOKUP[from].map((to) => ({
    attacker: { square: from, type: PieceType.King },
    square: to,
    slideSquares: [],
  }));
};

export const bishopMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
): SquareControlObject[] =>
  BISHOP_LOOKUP[from].flatMap((ray) =>
    rayControlScanner(
      pieces,
      { square: from, piece: { color, type: PieceType.Bishop } },
      ray,
    ),
  );

export const rookMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
): SquareControlObject[] =>
  ROOK_LOOKUP[from].flatMap((ray) =>
    rayControlScanner(
      pieces,
      { square: from, piece: { color, type: PieceType.Rook } },
      ray,
    ),
  );

export const queenMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
): SquareControlObject[] => [
  ...bishopMoves(pieces, color, from),
  ...rookMoves(pieces, color, from),
];

export const forPiece = (
  piece: Piece,
  pieces: Map<Square, Piece>,
  square: Square,
): SquareControlObject[] => {
  switch (piece.type) {
    case PieceType.Bishop:
      return bishopMoves(pieces, piece.color, square);
    case PieceType.King:
      return kingMoves(square);
    case PieceType.Knight:
      return knightMoves(square);
    case PieceType.Pawn:
      return pawnMoves(piece.color, square);
    case PieceType.Queen:
      return queenMoves(pieces, piece.color, square);
    case PieceType.Rook:
      return rookMoves(pieces, piece.color, square);
  }
};
