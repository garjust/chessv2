import { CastlingMask } from '../castling';
import {
  CastlingState,
  MoveWithExtraData,
  Piece,
  PieceType,
  Square,
  SquareControl,
} from '../types';
import AttackMap from './attack-map';
import {
  CASTLING_KING_MOVES,
  KING_MOVES,
  KNIGHT_MOVES,
  PAWN_CAPTURE_MOVES,
} from './lookup';
import {
  BISHOP_RAY_MOVES,
  PAWN_ADVANCE_MOVES,
  QUEEN_RAY_MOVES,
  ROOK_RAY_MOVES,
} from './lookup/piece-moves';
import { left, rayControlScanner, right } from './move-utils';

export const controlForPiece = (
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

export const pawnAdvanceMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
): MoveWithExtraData[] => {
  // Note: the array returned here can have 3 specific lengths which we can
  // use for checking move legality.
  const moves = PAWN_ADVANCE_MOVES[piece.color][from];

  if (moves.length === 0) {
    return moves;
  } else {
    if (pieces.has(moves[0].to)) {
      // There is a piece blocking pawn advancement.
      return [];
    }

    if (moves.length === 2) {
      if (pieces.has(moves[1].to)) {
        return [moves[0]];
      } else {
        return moves;
      }
    } else {
      return moves;
    }
  }
};

export const kingCastlingMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
  opponentAttackMap: AttackMap,
  castlingState: CastlingState,
): MoveWithExtraData[] => {
  const moves: MoveWithExtraData[] = [];

  // Check if castling is possible and there are no pieces between the king
  // and the corresponding rook.
  if (
    (castlingState & (CastlingMask.WhiteKingside << (piece.color * 2))) > 0 &&
    // Check squares being castled through are empty
    !pieces.has(right(from)) &&
    !pieces.has(right(from, 2)) &&
    // Also check nothing is attacking the square being castled through. It is
    // still possible the king is skewered to this square by a check but we
    // will detect that later in move generation
    !opponentAttackMap.isAttacked(right(from))
  ) {
    moves.push(CASTLING_KING_MOVES[piece.color].kingside);
  }
  if (
    (castlingState & (CastlingMask.WhiteQueenside << (piece.color * 2))) > 0 &&
    // Check squares being castled through are empty
    !pieces.has(left(from)) &&
    !pieces.has(left(from, 2)) &&
    !pieces.has(left(from, 3)) &&
    // Also check nothing is attacking the square being castled through. It is
    // still possible the king is skewered to this square by a check but we
    // will detect that later in move generation
    !opponentAttackMap.isAttacked(left(from))
  ) {
    moves.push(CASTLING_KING_MOVES[piece.color].queenside);
  }

  return moves;
};
