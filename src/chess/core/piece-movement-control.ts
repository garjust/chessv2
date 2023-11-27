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

export const forPiece = (
  piece: Piece,
  pieces: Map<Square, Piece>,
  square: Square,
): SquareControl[] => {
  switch (piece.type) {
    case PieceType.Pawn:
      return PAWN_CAPTURE_MOVES[piece.color][square];
    case PieceType.King:
      return KING_MOVES[piece.color][square];
    case PieceType.Knight:
      return KNIGHT_MOVES[piece.color][square];
    case PieceType.Bishop:
      return BISHOP_RAYS[square].flatMap((ray) =>
        rayControlScanner(pieces, piece, square, ray),
      );
    case PieceType.Rook:
      return ROOK_RAYS[square].flatMap((ray) =>
        rayControlScanner(pieces, piece, square, ray),
      );
    case PieceType.Queen:
      return QUEEN_RAYS[square].flatMap((ray) =>
        rayControlScanner(pieces, piece, square, ray),
      );
  }
};
