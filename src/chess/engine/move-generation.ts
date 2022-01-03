import {
  Color,
  MoveWithExtraData,
  PieceMoves,
  Piece,
  PieceType,
  Square,
  AttackObject,
  ComputedMovementData,
  CastlingAvailability,
} from '../types';
import {
  isLegalSquare,
  flipColor,
  squaresInclude,
  isStartPositionPawn,
  isPromotionPositionPawn,
  CASTLING_AVAILABILITY_BLOCKED,
} from '../utils';
import {
  BISHOP_LOOKUP,
  KING_LOOKUP,
  KNIGHT_LOOKUP,
  ROOK_LOOKUP,
} from './move-lookup';
import { down, left, right, up, rayScanner } from './move-utils';
import { KingSquares, KingPins, KingChecks } from './types';

const pawnMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  {
    attacksOnly,
    enPassantSquare,
  }: { attacksOnly: boolean; enPassantSquare: Square | null }
): MoveWithExtraData[] => {
  let squares: MoveWithExtraData[] = [];
  const opponentColor = flipColor(color);
  const advanceFn = color === Color.White ? up : down;

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

  const leftCaptureSquare = advanceFn(left(from));
  const rightCaptureSquare = advanceFn(right(from));

  const leftCapturePiece = pieces.get(leftCaptureSquare);
  const rightCapturePiece = pieces.get(rightCaptureSquare);

  // Pawn captures diagonally.
  if (
    leftCaptureSquare % 8 !== 7 &&
    leftCapturePiece &&
    (leftCapturePiece?.color === opponentColor ||
      enPassantSquare === leftCaptureSquare)
  ) {
    squares.push({
      from,
      to: leftCaptureSquare,
      piece: { type: PieceType.Pawn, color },
      attack: {
        attacker: { square: from, type: PieceType.Pawn },
        attacked: { square: leftCaptureSquare, type: leftCapturePiece?.type },
        slideSquares: [],
      },
    });
  }
  if (
    rightCaptureSquare % 8 !== 0 &&
    rightCapturePiece &&
    (rightCapturePiece?.color === opponentColor ||
      enPassantSquare === rightCaptureSquare)
  ) {
    squares.push({
      from,
      to: rightCaptureSquare,
      piece: { type: PieceType.Pawn, color },
      attack: {
        attacker: { square: from, type: PieceType.Pawn },
        attacked: { square: rightCaptureSquare, type: rightCapturePiece?.type },
        slideSquares: [],
      },
    });
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

const knightMoves = (
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

const kingMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  {
    enPassantSquare,
    castlingAvailability,
  }: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): MoveWithExtraData[] => {
  const squares = KING_LOOKUP[from].filter(
    (to) => pieces.get(to)?.color !== color
  );

  // Check if castling is possible and there are no pieces between the king
  // and the corresponding rook.
  if (
    castlingAvailability[color].kingside &&
    !pieces.get(right(from)) &&
    // Also check nothing is attacking the square being castled through
    attacksOnSquare(pieces, flipColor(color), right(from), {
      enPassantSquare,
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
    attacksOnSquare(pieces, flipColor(color), left(from), {
      enPassantSquare,
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

const bishopMoves = (
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

const rookMoves = (
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

const queenMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  options: { skip: Square[] }
): MoveWithExtraData[] => [
  ...bishopMoves(pieces, color, from, options),
  ...rookMoves(pieces, color, from, options),
];

export const attacksOnSquare = (
  pieces: Map<Square, Piece>,
  attackingColor: Color,
  square: Square,
  {
    enPassantSquare,
    skip,
  }: {
    enPassantSquare: Square | null;
    skip: Square[];
  }
): AttackObject[] => {
  const attacks: AttackObject[] = [];
  const color = flipColor(attackingColor);

  // Generate the moves for a super piece of the defending color
  // on the target square.
  const superPieceMoves = [
    kingMoves(pieces, color, square, {
      enPassantSquare,
      castlingAvailability: CASTLING_AVAILABILITY_BLOCKED,
    }),
    bishopMoves(pieces, color, square, { skip }),
    rookMoves(pieces, color, square, { skip }),
    knightMoves(pieces, color, square),
    pawnMoves(pieces, color, square, {
      attacksOnly: true,
      enPassantSquare: enPassantSquare,
    }),
  ];

  // Go through each move looking for attacks. An attack is valid if
  // the attacking and attacked piece are the same type.
  //
  // Note: treat bishops and rooks as queens as well
  for (const movesByPieceType of superPieceMoves) {
    for (const move of movesByPieceType) {
      if (move.attack) {
        const piece = pieces.get(move.to);
        if (
          move.attack.attacker.type === PieceType.Bishop ||
          move.attack.attacker.type === PieceType.Rook
        ) {
          if (
            piece &&
            (piece.type === move.attack.attacker.type ||
              piece.type === PieceType.Queen)
          ) {
            // We need to reverse the super piece move to find the real attack.
            attacks.push({
              attacked: move.attack.attacker,
              attacker: move.attack.attacked,
              slideSquares: move.attack.slideSquares,
            });
          }
        } else {
          if (piece && piece.type === move.attack.attacker.type) {
            // We need to reverse the super piece move to find the real attack.
            attacks.push({
              attacked: move.attack.attacker,
              attacker: move.attack.attacked,
              slideSquares: move.attack.slideSquares,
            });
          }
        }
      }
    }
  }

  return attacks;
};

const movesForPiece = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  square: Square,
  {
    enPassantSquare,
    castlingAvailability,
  }: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
) => {
  const moves: MoveWithExtraData[] = [];

  switch (piece.type) {
    case PieceType.Bishop:
      moves.push(...bishopMoves(pieces, piece.color, square, { skip: [] }));
      break;
    case PieceType.King:
      moves.push(
        ...kingMoves(pieces, piece.color, square, {
          enPassantSquare,
          castlingAvailability,
        })
      );
      break;
    case PieceType.Knight:
      moves.push(...knightMoves(pieces, piece.color, square));
      break;
    case PieceType.Pawn:
      moves.push(
        ...pawnMoves(pieces, piece.color, square, {
          attacksOnly: false,
          enPassantSquare,
        })
      );
      break;
    case PieceType.Queen:
      moves.push(...queenMoves(pieces, piece.color, square, { skip: [] }));
      break;
    case PieceType.Rook:
      moves.push(...rookMoves(pieces, piece.color, square, { skip: [] }));
      break;
  }

  return moves;
};

const movesForPosition = (
  pieces: Map<Square, Piece>,
  options: {
    color?: Color;
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): PieceMoves[] => {
  const pieceMoves: PieceMoves[] = [];

  const { color, enPassantSquare, castlingAvailability } = options;

  for (const [square, piece] of pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }
    const moves = movesForPiece(pieces, piece, square, {
      enPassantSquare,
      castlingAvailability,
    });
    pieceMoves.push({
      piece,
      moves: moves.map((move) => ({ ...move, from: square })),
    });
  }

  return pieceMoves;
};

export const generateMovementData = (
  pieces: Map<Square, Piece>,
  color: Color,
  {
    pinsToKing,
    kings,
    enPassantSquare,
    castlingAvailability,
  }: {
    pinsToKing: KingPins;
    checks: KingChecks;
    kings: KingSquares;
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): ComputedMovementData => {
  let checksForPlayer: AttackObject[] = [];
  const king = kings[color];
  if (king) {
    checksForPlayer = attacksOnSquare(pieces, flipColor(color), king, {
      enPassantSquare,
      skip: [king],
    });
  }

  const allMoves: MoveWithExtraData[] = [];

  const movesets = movesForPosition(pieces, {
    color,
    enPassantSquare,
    castlingAvailability:
      checksForPlayer.length > 0
        ? CASTLING_AVAILABILITY_BLOCKED
        : castlingAvailability,
  });

  for (const { piece, moves } of movesets) {
    let legalMoves: MoveWithExtraData[];

    // We need to prune moves when in check since only moves that remove the
    // check are legal.
    if (checksForPlayer.length > 0) {
      if (checksForPlayer.length === 1) {
        const check = checksForPlayer[0];
        // In the case that the king is checked by a single piece we can capture
        // the piece or block the attack.
        if (piece.type !== PieceType.King) {
          legalMoves = moves.filter(
            (move) =>
              squaresInclude(check.slideSquares, move.to) ||
              check.attacker.square === move.to
          );
        } else {
          // The king can only move out of the check or capture the checking
          // piece. The king cannot block the check.
          legalMoves = moves.filter(
            (move) =>
              !squaresInclude(
                check.slideSquares,
                // attacked[flipColor(color)],
                move.to
              )
          );
        }
      } else {
        // In the case that the king is checked by multiple pieces (can only be 2)
        // the king must move.

        // Prune all moves if the piece is not the king.
        if (piece.type !== PieceType.King) {
          legalMoves = [];
        }
        // Prune king moves that move to an attacked square.
        legalMoves = moves.filter(
          (move) =>
            !squaresInclude(
              checksForPlayer.flatMap((check) => check.slideSquares),
              // attacked[flipColor(color)],
              move.to
            )
        );
      }
    }

    // We need to prune moves that result in a check on ourselves.
    //
    // To do this we track pieces that are pinned to the king as well as
    // looking at king moves.
    const king = kings[color];
    legalMoves = moves.filter((move) => {
      if (move.from === king) {
        // This is a king move, verify the destination square is not attacked.
        return (
          attacksOnSquare(pieces, flipColor(color), move.to, {
            enPassantSquare: enPassantSquare,
            skip: [king],
          }).length === 0
        );
      } else {
        const pin = pinsToKing[color].get(move.from);
        if (!pin) {
          return true;
        }

        // We are dealing with a pinned piece.
        return (
          pin.legalMoveSquares.includes(move.to) || move.to === pin.attacker
        );
      }
    });

    allMoves.push(...legalMoves);
  }

  return {
    moves: allMoves,
    checks: checksForPlayer,
  };
};
