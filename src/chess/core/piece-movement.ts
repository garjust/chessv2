import {
  Color,
  MoveWithExtraData,
  Piece,
  PieceType,
  Square,
  CastlingAvailability,
} from '../types';
import {
  isLegalSquare,
  isStartPositionPawn,
  isPromotionPositionPawn,
} from '../utils';
import AttackMap from './attack-map';
import { down, expandPromotions, left, right, up } from './move-utils';

const expandAllPromotions = (moves: MoveWithExtraData[]) =>
  moves.flatMap((move) => expandPromotions(move));

export const advancePawnMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
): MoveWithExtraData[] => {
  let squares: MoveWithExtraData[] = [];
  const advanceFn = piece.color === Color.White ? up : down;

  // Space forward of the pawn.
  if (isLegalSquare(advanceFn(from)) && !pieces.has(advanceFn(from))) {
    squares.push({
      from,
      to: advanceFn(from),
      piece,
      attack: false,
    });

    // Space two squares forward of the pawn when it is in it's starting rank.
    if (
      !pieces.has(advanceFn(from, 2)) &&
      isStartPositionPawn(piece.color, from)
    ) {
      squares.push({
        from,
        to: advanceFn(from, 2),
        piece,
        attack: false,
      });
    }
  }

  // If the pawn will promote on next advancement take the possible pawn moves
  // and add possible promotions.
  if (isPromotionPositionPawn(piece.color, from)) {
    squares = expandAllPromotions(squares);
  }

  return squares;
};

export const castlingKingMoves = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
  opponentAttackMap: AttackMap,
  castlingAvailability: CastlingAvailability,
): MoveWithExtraData[] => {
  const squares = [];

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
    squares.push(right(from, 2));
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
    squares.push(left(from, 2));
  }

  return squares.map((to) => ({
    from,
    to,
    piece,
    attack: false,
  }));
};
