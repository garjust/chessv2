import {
  Color,
  Piece,
  PieceType,
  Square,
  AttackObject,
  Move,
  SquareControlObject,
} from '../types';
import { flipColor, CASTLING_AVAILABILITY_BLOCKED } from '../utils';
import {
  BISHOP_RAY_BITARRAYS,
  QUEEN_RAY_BITARRAYS,
  ROOK_RAY_BITARRAYS,
} from './move-lookup';
import {
  bishopMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  rookMoves,
} from './piece-movement';
import { forPiece } from './piece-movement-control';
import { AttackedSquares } from './types';

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
      castlingOnly: false,
      castlingAvailability: CASTLING_AVAILABILITY_BLOCKED,
    }),
    bishopMoves(pieces, color, square, { skip }),
    rookMoves(pieces, color, square, { skip }),
    knightMoves(pieces, color, square),
    pawnMoves(pieces, color, square, {
      advanceOnly: false,
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

export const updateAttackedSquares = (
  attackedSquares: AttackedSquares,
  pieces: Map<Square, Piece>,
  move: Move,
  movedPiece: Piece
) => {
  attackedSquares[Color.White].startChangeset();
  attackedSquares[Color.Black].startChangeset();

  const opponentColor = flipColor(movedPiece.color);

  attackedSquares[movedPiece.color].removeAttacks(move.from);
  attackedSquares[movedPiece.color].removeAttacks(move.to);
  attackedSquares[opponentColor].removeAttacks(move.to);

  // Find the squares that are now attacked by the moved piece.
  const newAttacks: SquareControlObject[] = forPiece(
    movedPiece,
    pieces,
    move.to
  );
  attackedSquares[movedPiece.color].addAttacks(move.to, newAttacks);

  // Find sliding pieces affected by the moved piece.
  for (const [square, piece] of pieces) {
    if (square === move.from || square === move.to) {
      // We have already covered pieces in the move from/to squares.
      continue;
    }

    let isFromIncident = false;
    let isToIncident = false;

    switch (piece.type) {
      case PieceType.Bishop:
        isFromIncident = BISHOP_RAY_BITARRAYS[square][move.from];
        isToIncident = BISHOP_RAY_BITARRAYS[square][move.to];
        break;
      case PieceType.Rook:
        isFromIncident = ROOK_RAY_BITARRAYS[square][move.from];
        isToIncident = ROOK_RAY_BITARRAYS[square][move.to];
        break;
      case PieceType.Queen:
        isFromIncident = QUEEN_RAY_BITARRAYS[square][move.from];
        isToIncident = QUEEN_RAY_BITARRAYS[square][move.to];
        break;
      default:
        break;
    }

    if (isFromIncident || isToIncident) {
      attackedSquares[piece.color].removeAttacks(square);
      const newAttacks: SquareControlObject[] = forPiece(piece, pieces, square);
      attackedSquares[piece.color].addAttacks(square, newAttacks);
    }
  }
};
