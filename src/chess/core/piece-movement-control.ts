import { Piece, PieceType, Square, SquareControl } from '../types';
import {
  BISHOP_RAYS,
  KING_MOVES,
  KNIGHT_MOVES,
  PAWN_CAPTURE_MOVES,
  QUEEN_RAYS,
  ROOK_RAYS,
} from './lookup';
import { rayControlScanner } from './move-utils';

export const pawnMoves = (piece: Piece, from: Square): SquareControl[] =>
  PAWN_CAPTURE_MOVES[piece.color][from];

export const knightMoves = (from: Square, piece: Piece): SquareControl[] =>
  KNIGHT_MOVES[piece.color][from];

export const kingMoves = (from: Square, piece: Piece): SquareControl[] =>
  KING_MOVES[piece.color][from];

export const bishopMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
): SquareControl[] =>
  BISHOP_RAYS[from].flatMap((ray) =>
    rayControlScanner(pieces, piece, from, ray),
  );

export const rookMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
): SquareControl[] =>
  ROOK_RAYS[from].flatMap((ray) => rayControlScanner(pieces, piece, from, ray));

export const queenMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
): SquareControl[] =>
  QUEEN_RAYS[from].flatMap((ray) =>
    rayControlScanner(pieces, piece, from, ray),
  );

export const forPiece = (
  piece: Piece,
  pieces: Map<Square, Piece>,
  square: Square,
): SquareControl[] => {
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
