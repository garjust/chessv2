import { SquareMap } from '../square-map';
import {
  Color,
  Piece,
  PieceType,
  Square,
  AttackObject,
  MoveWithExtraData,
} from '../types';
import {
  flipColor,
  CASTLING_AVAILABILITY_BLOCKED,
  squareGenerator,
} from '../utils';
import { isMoveInFile } from './move-utils';
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  rookMoves,
} from './piece-movement';

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

export const allAttackedSquares = (
  pieces: Map<Square, Piece>,
  attackingColor: Color,
  {
    enPassantSquare,
  }: {
    enPassantSquare: Square | null;
  }
): Map<Square, boolean> => {
  const attacks: Map<Square, boolean> = new SquareMap<boolean>();

  for (let square = 0; square < 64; square++) {
    attacks.set(
      square,
      attacksOnSquare(pieces, attackingColor, square, {
        enPassantSquare,
        skip: [],
      }).length > 0
    );
  }

  return attacks;
};

// Flawed, misses pawn captures when no piece is in pawn capture square
// misses attacks on own pieces, which count.
export const allAttackedSquaresFromMoves = (
  moves: MoveWithExtraData[]
): Map<Square, boolean> => {
  const attacks: Map<Square, boolean> = new SquareMap<boolean>();

  for (const move of moves) {
    if (move.piece.type === PieceType.Pawn && isMoveInFile(move)) {
      continue;
    }
    attacks.set(move.to, true);
  }

  return attacks;
};
