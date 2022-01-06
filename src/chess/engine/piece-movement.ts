import {
  Color,
  MoveWithExtraData,
  Piece,
  PieceType,
  Square,
  AttackObject,
  CastlingAvailability,
} from '../types';
import {
  isLegalSquare,
  flipColor,
  isStartPositionPawn,
  isPromotionPositionPawn,
} from '../utils';
import { attacksOnSquare } from './attacks';
import {
  BISHOP_LOOKUP,
  KING_LOOKUP,
  KNIGHT_LOOKUP,
  ROOK_LOOKUP,
} from './move-lookup';
import { down, left, right, up, rayScanner } from './move-utils';
import { PieceAttacks } from './types';

export const pawnMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  {
    attacksOnly,
    advanceOnly,
    enPassantSquare,
  }: {
    attacksOnly: boolean;
    advanceOnly: boolean;
    enPassantSquare: Square | null;
  }
): MoveWithExtraData[] => {
  let squares: MoveWithExtraData[] = [];
  const opponentColor = flipColor(color);
  const advanceFn = color === Color.White ? up : down;
  const opponentAdvanceFn = color === Color.White ? down : up;

  // Space forward of the pawn.
  if (
    !attacksOnly &&
    isLegalSquare(advanceFn(from)) &&
    !pieces.get(advanceFn(from))
  ) {
    squares.push({
      from,
      to: advanceFn(from),
      piece: { type: PieceType.Pawn, color },
    });

    // Space two squares forward of the pawn when it is in it's starting rank.
    if (!pieces.get(advanceFn(from, 2)) && isStartPositionPawn(color, from)) {
      squares.push({
        from,
        to: advanceFn(from, 2),
        piece: { type: PieceType.Pawn, color },
      });
    }
  }

  // Pawn captures diagonally.
  if (!advanceOnly) {
    const leftCaptureSquare = advanceFn(left(from));
    const rightCaptureSquare = advanceFn(right(from));

    const leftCapturePiece =
      leftCaptureSquare === enPassantSquare
        ? pieces.get(opponentAdvanceFn(enPassantSquare))
        : pieces.get(leftCaptureSquare);
    const rightCapturePiece =
      rightCaptureSquare === enPassantSquare
        ? pieces.get(opponentAdvanceFn(enPassantSquare))
        : pieces.get(rightCaptureSquare);

    if (
      leftCaptureSquare % 8 !== 7 &&
      leftCapturePiece?.color === opponentColor
    ) {
      squares.push({
        from,
        to: leftCaptureSquare,
        piece: { type: PieceType.Pawn, color },
        attack: {
          attacker: { square: from, type: PieceType.Pawn },
          attacked: { square: leftCaptureSquare, type: leftCapturePiece.type },
          slideSquares: [],
        },
      });
    }
    if (
      rightCaptureSquare % 8 !== 0 &&
      rightCapturePiece?.color === opponentColor
    ) {
      squares.push({
        from,
        to: rightCaptureSquare,
        piece: { type: PieceType.Pawn, color },
        attack: {
          attacker: { square: from, type: PieceType.Pawn },
          attacked: {
            square: rightCaptureSquare,
            type: rightCapturePiece.type,
          },
          slideSquares: [],
        },
      });
    }
  }

  // If the pawn will promote on next advancement take the possible pawn moves
  // and add possible promotions.
  if (isPromotionPositionPawn(color, from)) {
    squares = squares.flatMap((move) =>
      [PieceType.Bishop, PieceType.Knight, PieceType.Queen, PieceType.Rook].map(
        (pieceType) => ({ ...move, promotion: pieceType })
      )
    );
  }

  return squares;
};

export const knightMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square
): MoveWithExtraData[] =>
  KNIGHT_LOOKUP[from]
    .filter((to) => pieces.get(to)?.color !== color)
    .map((to) => {
      let attack: AttackObject | undefined;
      const piece = pieces.get(to);
      if (piece) {
        attack = {
          attacker: { square: from, type: PieceType.Knight },
          attacked: { square: to, type: piece.type },
          slideSquares: [],
        };
      }

      return {
        from,
        to,
        piece: { type: PieceType.Knight, color },
        attack,
      };
    });

export const kingMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  {
    castlingOnly,
    castlingAvailability,
    pieceAttacks,
  }: {
    castlingOnly: boolean;
    castlingAvailability: CastlingAvailability;
    pieceAttacks: PieceAttacks;
  }
): MoveWithExtraData[] => {
  const squares = castlingOnly
    ? []
    : KING_LOOKUP[from].filter((to) => pieces.get(to)?.color !== color);

  // Check if castling is possible and there are no pieces between the king
  // and the corresponding rook.
  if (
    castlingAvailability[color].kingside &&
    !pieces.get(right(from)) &&
    // Also check nothing is attacking the square being castled through
    // pieceAttacks[flipColor(color)].get(right(from))?.length === 0 &&
    attacksOnSquare(pieces, flipColor(color), right(from), {
      enPassantSquare: null,
      skip: [from],
    }).length === 0 &&
    !pieces.get(right(from, 2))
  ) {
    squares.push(right(from, 2));
  }
  if (
    castlingAvailability[color].queenside &&
    !pieces.get(left(from)) &&
    // Also check nothing is attacking the square being castled through
    // pieceAttacks[flipColor(color)].get(left(from))?.length === 0 &&
    attacksOnSquare(pieces, flipColor(color), left(from), {
      enPassantSquare: null,
      skip: [from],
    }).length === 0 &&
    !pieces.get(left(from, 2)) &&
    !pieces.get(left(from, 3))
  ) {
    squares.push(left(from, 2));
  }

  return squares.map((to) => {
    let attack: AttackObject | undefined;
    const piece = pieces.get(to);
    if (piece) {
      attack = {
        attacker: { square: from, type: PieceType.King },
        attacked: { square: to, type: piece.type },
        slideSquares: [],
      };
    }

    return {
      from,
      to,
      piece: { type: PieceType.King, color },
      attack,
    };
  });
};

export const bishopMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  { skip = [] }: { skip: Square[] }
): MoveWithExtraData[] =>
  BISHOP_LOOKUP[from].flatMap((ray) =>
    rayScanner(
      pieces,
      { square: from, piece: { color, type: PieceType.Bishop } },
      ray,
      { skip }
    )
  );

export const rookMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  { skip = [] }: { skip: Square[] }
): MoveWithExtraData[] =>
  ROOK_LOOKUP[from].flatMap((ray) =>
    rayScanner(
      pieces,
      { square: from, piece: { color, type: PieceType.Rook } },
      ray,
      { skip }
    )
  );

export const queenMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  options: { skip: Square[] }
): MoveWithExtraData[] => [
  ...bishopMoves(pieces, color, from, options),
  ...rookMoves(pieces, color, from, options),
];
