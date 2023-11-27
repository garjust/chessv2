import {
  MoveWithExtraData,
  Piece,
  Square,
  CastlingAvailability,
} from '../types';
import AttackMap from './attack-map';
import { CASTLING_KING_MOVES, PAWN_ADVANCE_MOVES } from './lookup';
import { left, right } from './move-utils';

export const advancePawnMoves = (
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

export const castlingKingMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
  opponentAttackMap: AttackMap,
  castlingAvailability: CastlingAvailability,
): MoveWithExtraData[] => {
  const moves: MoveWithExtraData[] = [];

  // Check if castling is possible and there are no pieces between the king
  // and the corresponding rook.
  if (
    castlingAvailability[piece.color].kingside &&
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
    castlingAvailability[piece.color].queenside &&
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
