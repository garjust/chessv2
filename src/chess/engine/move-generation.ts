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
  Pin,
} from '../types';
import {
  flipColor,
  squaresInclude,
  CASTLING_AVAILABILITY_BLOCKED,
} from '../utils';
import { attacksOnSquare } from './attacks';
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
} from './piece-movement';
import {
  KingSquares,
  KingPins,
  KingChecks,
  AttackedSquares,
  PieceAttacks,
} from './types';

const movesForPiece = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  square: Square,
  {
    enPassantSquare,
    castlingAvailability,
    pieceAttacks,
  }: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
    pieceAttacks: PieceAttacks;
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
          castlingOnly: false,
          castlingAvailability,
          pieceAttacks,
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
          advanceOnly: false,
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
    pieceAttacks: PieceAttacks;
  }
): PieceMoves[] => {
  const pieceMoves: PieceMoves[] = [];

  const { color, enPassantSquare, castlingAvailability, pieceAttacks } =
    options;

  for (const [square, piece] of pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }
    const moves = movesForPiece(pieces, piece, square, {
      enPassantSquare,
      castlingAvailability,
      pieceAttacks,
    });
    pieceMoves.push({
      piece,
      moves: moves.map((move) => ({ ...move, from: square })),
    });
  }

  return pieceMoves;
};

const movesForPositionFromAttacks = (
  pieces: Map<Square, Piece>,
  options: {
    color?: Color;
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
    pieceAttacks: PieceAttacks;
  }
): PieceMoves[] => {
  const pieceMoves: PieceMoves[] = [];

  const { color, enPassantSquare, castlingAvailability, pieceAttacks } =
    options;

  for (const [square, piece] of pieces.entries()) {
    if (color && piece.color !== color) {
      continue;
    }

    const moves: MoveWithExtraData[] = [];
    const attacks = pieceAttacks[piece.color].get(square) ?? [];

    for (const squareControl of attacks) {
      const attackedPiece = pieces.get(squareControl.square);

      // Get rid of attacks on own-pieces.
      if (attackedPiece && attackedPiece.color === color) {
        continue;
      }

      if (piece.type === PieceType.Pawn) {
        // The only pawn moves here are capturing moves, so make sure they
        // are actually captures.
        if (!attackedPiece && squareControl.square !== enPassantSquare) {
          continue;
        }
      }

      moves.push({
        from: squareControl.attacker.square,
        to: squareControl.square,
        piece,
        attack: attackedPiece
          ? {
              attacked: {
                square: squareControl.square,
                type: attackedPiece.type,
              },
              attacker: { square, type: piece.type },
              slideSquares: squareControl.slideSquares,
            }
          : undefined,
      });
    }

    if (piece.type === PieceType.King) {
      // Add castling moves
      moves.push(
        ...kingMoves(pieces, piece.color, square, {
          castlingOnly: true,
          castlingAvailability,
          pieceAttacks,
        })
      );
    } else if (piece.type === PieceType.Pawn) {
      // Add advance moves.
      moves.push(
        ...pawnMoves(pieces, piece.color, square, {
          attacksOnly: false,
          advanceOnly: true,
          enPassantSquare,
        })
      );
    }

    pieceMoves.push({
      piece,
      moves,
    });
  }

  return pieceMoves;
};

const pruneMovesInCheck = (
  checks: AttackObject[],
  piece: Piece,
  moves: MoveWithExtraData[]
): MoveWithExtraData[] => {
  // If the moving piece is a king all it's moves should be retained. Moves
  // into an attacked square are pruned elsewhere.
  if (piece.type === PieceType.King) {
    return moves;
  }

  // We need to prune moves when in check since only moves that remove the
  // check are legal.
  if (checks.length > 0) {
    if (checks.length === 1) {
      const check = checks[0];
      // In the case that the king is checked by a single piece we can capture
      // the piece or block the attack.
      return moves.filter(
        (move) =>
          squaresInclude(check.slideSquares, move.to) ||
          check.attacker.square === move.to
      );
    } else {
      // In the case that the king is checked by multiple pieces (can only be 2)
      // the king must move.
      return [];
    }
  }

  return moves;
};

const pruneChecks = (
  pieces: Map<Square, Piece>,
  color: Color,
  king: Square,
  moves: MoveWithExtraData[],
  pins: Map<Square, Pin>
) => {
  return moves.filter((move) => {
    if (move.from === king) {
      // This is a king move, verify the destination square is not attacked.
      return (
        attacksOnSquare(pieces, flipColor(color), move.to, {
          enPassantSquare: null,
          skip: [king],
        }).length === 0
      );
    } else {
      const pin = pins.get(move.from);
      if (!pin) {
        return true;
      }

      // We are dealing with a pinned piece.
      return pin.legalMoveSquares.includes(move.to) || move.to === pin.attacker;
    }
  });
};

const pruneChecksWithAttackMap = (
  king: Square,
  moves: MoveWithExtraData[],
  attackMap: Map<Square, number>,
  pins: Map<Square, Pin>
) => {
  // We need to prune moves that result in a check on ourselves.
  //
  // To do this we track pieces that are pinned to the king as well as
  // looking at king moves.
  return moves.filter((move) => {
    if (move.from === king) {
      // This is a king move, verify the destination square is not attacked.
      return attackMap.get(move.to) === 0;
    } else {
      const pin = pins.get(move.from);
      if (!pin) {
        return true;
      }

      // We are dealing with a pinned piece.
      return pin.legalMoveSquares.includes(move.to) || move.to === pin.attacker;
    }
  });
};

export const generateMovementData = (
  pieces: Map<Square, Piece>,
  color: Color,
  {
    attackedSquares,
    pieceAttacks,
    pinsToKing,
    kings,
    enPassantSquare,
    castlingAvailability,
  }: {
    attackedSquares: AttackedSquares;
    pieceAttacks: PieceAttacks;
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

  // const movesets = movesForPositionFromAttacks(pieces, {
  const movesets = movesForPosition(pieces, {
    color,
    enPassantSquare,
    castlingAvailability:
      checksForPlayer.length > 0
        ? CASTLING_AVAILABILITY_BLOCKED
        : castlingAvailability,
    pieceAttacks,
  });

  for (const { piece, moves } of movesets) {
    let legalMoves: MoveWithExtraData[] = moves;

    if (king) {
      legalMoves = pruneMovesInCheck(checksForPlayer, piece, legalMoves);
      legalMoves = pruneChecks(
        pieces,
        color,
        king,
        legalMoves,
        pinsToKing[color]
      );
      // legalMoves = pruneChecksWithAttackMap(
      //   king,
      //   legalMoves,
      //   attackedSquares[flipColor(color)],
      //   pinsToKing[color]
      // );
    }

    allMoves.push(...legalMoves);
  }

  return {
    moves: allMoves,
    checks: checksForPlayer,
  };
};
