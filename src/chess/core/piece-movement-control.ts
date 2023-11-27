import { Piece, PieceType, Square, SquareControl } from '../types';
import { KING_MOVES, KNIGHT_MOVES, PAWN_CAPTURE_MOVES } from './lookup';
import {
  BISHOP_RAY_MOVES,
  QUEEN_RAY_MOVES,
  ROOK_RAY_MOVES,
} from './lookup/piece-moves';
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
      return BISHOP_RAY_MOVES[piece.color][square].flatMap((ray) =>
        rayControlScanner(pieces, ray),
      );
    case PieceType.Rook:
      return ROOK_RAY_MOVES[piece.color][square].flatMap((ray) =>
        rayControlScanner(pieces, ray),
      );
    case PieceType.Queen:
      return QUEEN_RAY_MOVES[piece.color][square].flatMap((ray) =>
        rayControlScanner(pieces, ray),
      );
  }
};
