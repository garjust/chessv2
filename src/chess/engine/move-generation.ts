import { SquareMap } from '../square-map';
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
  isSlider,
} from '../utils';
import { applyMove, undoMove } from './move-execution';
import {
  BISHOP_LOOKUP,
  KING_LOOKUP,
  KNIGHT_LOOKUP,
  ROOK_LOOKUP,
} from './move-lookup';
import { down, left, right, up, rayScanner } from './move-utils';
import { KingSquares, Pin, Pins, Position } from './types';

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
    !pieces.get(advanceFn(from)) &&
    isLegalSquare(advanceFn(from)) &&
    !attacksOnly
  ) {
    squares.push({ from, to: advanceFn(from) });

    // Space two squares forward of the pawn when it is in it's starting rank.
    if (!pieces.get(advanceFn(from, 2)) && isStartPositionPawn(color, from)) {
      squares.push({ from, to: advanceFn(from, 2) });
    }
  }

  const leftCaptureSquare = advanceFn(left(from));
  const rightCaptureSquare = advanceFn(right(from));

  // Pawn captures diagonally.
  if (
    leftCaptureSquare % 8 !== 7 &&
    (pieces.get(leftCaptureSquare)?.color === opponentColor ||
      enPassantSquare === leftCaptureSquare)
  ) {
    squares.push({
      from,
      to: leftCaptureSquare,
      attack: {
        attacker: { square: from, type: PieceType.Pawn },
        attacked: leftCaptureSquare,
        slideSquares: [],
      },
    });
  }
  if (
    rightCaptureSquare % 8 !== 0 &&
    (pieces.get(rightCaptureSquare)?.color === opponentColor ||
      enPassantSquare === rightCaptureSquare)
  ) {
    squares.push({
      from,
      to: rightCaptureSquare,
      attack: {
        attacker: { square: from, type: PieceType.Pawn },
        attacked: rightCaptureSquare,
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
      if (pieces.get(to)) {
        attack = {
          attacker: { square: from, type: PieceType.Knight },
          attacked: to,
          slideSquares: [],
        };
      }

      return {
        from,
        to,
        attack,
      };
    });

const kingMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square,
  {
    skipCastling,
    enPassantSquare,
    castlingAvailability,
  }: {
    skipCastling: boolean;
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
    !skipCastling &&
    castlingAvailability[color].kingside &&
    !pieces.get(right(from)) &&
    // Also check nothing is attacking the square being castled through
    attacksOnSquare(pieces, flipColor(color), right(from), {
      enPassantSquare,
      castlingAvailability,
    }).length === 0 &&
    !pieces.get(right(from, 2))
  ) {
    squares.push(right(from, 2));
  }
  if (
    !skipCastling &&
    castlingAvailability[color].queenside &&
    !pieces.get(left(from)) &&
    // Also check nothing is attacking the square being castled through
    attacksOnSquare(pieces, flipColor(color), left(from), {
      enPassantSquare,
      castlingAvailability,
    }).length === 0 &&
    !pieces.get(left(from, 2)) &&
    !pieces.get(left(from, 3))
  ) {
    squares.push(left(from, 2));
  }

  return squares.map((to) => {
    let attack: AttackObject | undefined;
    if (pieces.get(to)) {
      attack = {
        attacker: { square: from, type: PieceType.King },
        attacked: to,
        slideSquares: [],
      };
    }

    return {
      from,
      to,
      attack,
    };
  });
};

const bishopMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square
): MoveWithExtraData[] =>
  BISHOP_LOOKUP[from].flatMap((ray) =>
    rayScanner(
      pieces,
      { square: from, piece: { color, type: PieceType.Bishop } },
      ray
    )
  );

const rookMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square
): MoveWithExtraData[] =>
  ROOK_LOOKUP[from].flatMap((ray) =>
    rayScanner(
      pieces,
      { square: from, piece: { color, type: PieceType.Rook } },
      ray
    )
  );

const queenMoves = (
  pieces: Map<Square, Piece>,
  color: Color,
  from: Square
): MoveWithExtraData[] => [
  ...bishopMoves(pieces, color, from),
  ...rookMoves(pieces, color, from),
];

const attacksOnSquare = (
  pieces: Map<Square, Piece>,
  attackingColor: Color,
  square: Square,
  {
    enPassantSquare,
    castlingAvailability,
  }: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): AttackObject[] => {
  const attacks: AttackObject[] = [];
  const color = flipColor(attackingColor);

  // Generate the moves for a super piece of the defending color
  // on the target square.
  const superPieceMoves = [
    kingMoves(pieces, color, square, {
      skipCastling: true,
      enPassantSquare,
      castlingAvailability,
    }),
    bishopMoves(pieces, color, square),
    rookMoves(pieces, color, square),
    knightMoves(pieces, color, square),
    pawnMoves(pieces, color, square, {
      attacksOnly: true,
      enPassantSquare: enPassantSquare,
    }),
  ].flat();

  // Go through each move looking for attacks. An attack is valid if
  // the attacking and attacked piece are the same type.
  //
  // Note: treat bishops and rooks as queens as well
  superPieceMoves.forEach((move) => {
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
            attacked: move.attack.attacker.square,
            attacker: { square: move.attack.attacked, type: piece.type },
            slideSquares: move.attack.slideSquares,
          });
        }
      } else {
        if (piece && piece.type === move.attack.attacker.type) {
          // We need to reverse the super piece move to find the real attack.
          attacks.push({
            attacked: move.attack.attacker.square,
            attacker: { square: move.attack.attacked, type: piece.type },
            slideSquares: move.attack.slideSquares,
          });
        }
      }
    }
  });

  return attacks;
};

const movesForPiece = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  square: Square,
  {
    skipCastling,
    enPassantSquare,
    castlingAvailability,
  }: {
    skipCastling: boolean;
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
) => {
  const moves: MoveWithExtraData[] = [];

  switch (piece.type) {
    case PieceType.Bishop:
      moves.push(...bishopMoves(pieces, piece.color, square));
      break;
    case PieceType.King:
      moves.push(
        ...kingMoves(pieces, piece.color, square, {
          skipCastling,
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
      moves.push(...queenMoves(pieces, piece.color, square));
      break;
    case PieceType.Rook:
      moves.push(...rookMoves(pieces, piece.color, square));
      break;
  }

  return moves;
};

const movesForPosition = (
  pieces: Map<Square, Piece>,
  options: {
    color?: Color;
    skipCastling?: boolean;
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): PieceMoves[] => {
  const pieceMoves: PieceMoves[] = [];

  const { color, enPassantSquare, castlingAvailability } = options;
  const skipCastling = options.skipCastling ?? false;

  for (const [square, piece] of pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }
    const moves = movesForPiece(pieces, piece, square, {
      skipCastling,
      enPassantSquare,
      castlingAvailability,
    });
    pieceMoves.push({
      from: square,
      piece,
      moves: moves.map((move) => ({ ...move, from: square })),
    });
  }

  return pieceMoves;
};

const findAttacksOnKing = (
  pieces: Map<Square, Piece>,
  kings: KingSquares,
  attackingColor: Color,
  options: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): AttackObject[] => {
  const king = kings[flipColor(attackingColor)];
  if (!king) {
    return [];
  }

  return attacksOnSquare(pieces, attackingColor, king, options);
};

export const pinsToSquare = (
  pieces: Map<Square, Piece>,
  square: Square,
  color: Color
) => {
  const pins = new SquareMap<Pin>();

  const rays = [...BISHOP_LOOKUP[square], ...ROOK_LOOKUP[square]];
  for (const ray of rays) {
    // looking for a white piece then a black slider.
    const friendlyPieces: Square[] = [];
    const openSquares: Square[] = [];
    let opponentPiece: { square: Square; piece: Piece } | undefined;

    for (const square of ray) {
      const piece = pieces.get(square);
      if (piece) {
        if (piece.color === color) {
          friendlyPieces.push(square);
        } else {
          opponentPiece = { square, piece };
          break;
        }
      } else {
        openSquares.push(square);
      }
    }

    if (opponentPiece && isSlider(opponentPiece.piece.type)) {
      // We found a pin or sliding attack on the king!
      if (friendlyPieces.length === 1) {
        // With exactly one piece this is a standard pin to the king, which is
        // what we care about for move generation.
        pins.set(friendlyPieces[0], {
          pinned: friendlyPieces[0],
          attacker: opponentPiece.square,
          legalMoveSquares: openSquares,
        });
      }
    }
  }

  return pins;
};

export const generateMovementData = (
  pieces: Map<Square, Piece>,
  color: Color,
  position: Position,
  {
    pinsToKing,
    kings,
    enPassantSquare,
    castlingAvailability,
  }: {
    pinsToKing: Pins;
    kings: KingSquares;
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): ComputedMovementData => {
  const checks = findAttacksOnKing(pieces, kings, flipColor(color), {
    enPassantSquare,
    castlingAvailability,
  });

  const allMoves: MoveWithExtraData[] = [];
  const availableCaptures: MoveWithExtraData[] = [];

  const movesets = movesForPosition(pieces, {
    color,
    skipCastling: checks.length > 0,
    enPassantSquare,
    castlingAvailability,
  });

  movesets.forEach(({ piece, from, moves }) => {
    // We need to prune moves when in check since only moves that remove the
    // check are legal.
    if (checks.length > 0) {
      if (checks.length === 1) {
        const check = checks[0];
        // In the case that the king is checked by a single piece we can capture
        // the piece or block the attack.
        if (piece.type !== PieceType.King) {
          moves = moves.filter(
            (move) =>
              squaresInclude(check.slideSquares, move.to) ||
              check.attacker.square === move.to
          );
        } else {
          // The king can only move out of the check or capture the checking
          // piece. The king cannot block the check.
          moves = moves.filter(
            (move) =>
              !squaresInclude(
                check.slideSquares,
                // position.attacked[flipColor(position.turn)],
                move.to
              )
          );
        }
      } else {
        // In the case that the king is checked by multiple pieces (can only be 2)
        // the king must move.

        // Prune all moves if the piece is not the king.
        if (piece.type !== PieceType.King) {
          moves = [];
        }
        // Prune king moves that move to an attacked square.
        moves = moves.filter(
          (move) =>
            !squaresInclude(
              checks.flatMap((check) => check.slideSquares),
              // position.attacked[flipColor(position.turn)],
              move.to
            )
        );
      }
    }

    // We need to prune moves that result in a check on ourselves.
    //
    // This strategy computes an entirely new position after the candidate move
    // and then looks for attacks on the players king.
    // moves = moves.filter((move) => {
    //   const result = applyMove(position, { from, to: move.to });
    //   const attackCount = findAttacksOnKing(
    //     position.pieces,
    //     kings,
    //     position.turn,
    //     {
    //       enPassantSquare: position.enPassantSquare,
    //       castlingAvailability: position.castlingAvailability,
    //     }
    //   ).length;
    //   undoMove(position, result);
    //   return attackCount === 0;
    // });
    // Only worry about pinned pieces
    moves = moves.filter((move) => {
      const pin = pinsToKing[color].get(move.from);
      if (!pin) {
        return true;
      }

      // We are dealing with a pinned piece.
      return pin.legalMoveSquares.includes(move.to);
    });

    moves.forEach((move) => {
      if (move.attack) {
        const piece = pieces.get(move.from);
        if (piece) {
          availableCaptures.push(move);
        }
      }
    });

    allMoves.push(...moves);
  });

  return {
    moves: allMoves,
    checks,
    availableCaptures,
  };
};
