import {
  Color,
  Piece,
  PieceType,
  Square,
  AttackObject,
  Move,
  SquareControlObject,
} from '../types';
import {
  flipColor,
  CASTLING_AVAILABILITY_BLOCKED,
  directionOfMove,
  isSlider,
} from '../utils';
import {
  BISHOP_RAY_BITARRAYS,
  QUEEN_RAY_BITARRAYS,
  ROOK_RAY_BITARRAYS,
  RAY_BY_DIRECTION,
} from './move-lookup';
import { rayControlScanner } from './move-utils';
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

const sliderHasVision = (piece: Piece, pieceSquare: Square, square: Square) => {
  switch (piece.type) {
    case PieceType.Bishop:
      return BISHOP_RAY_BITARRAYS[pieceSquare][square];
    case PieceType.Rook:
      return ROOK_RAY_BITARRAYS[pieceSquare][square];
    case PieceType.Queen:
      return QUEEN_RAY_BITARRAYS[pieceSquare][square];
    default:
      return false;
  }
};

export const updateAttackedSquares = (
  attackedSquares: AttackedSquares,
  pieces: Map<Square, Piece>,
  move: Move,
  movedPiece: Piece,
  isCapture: boolean
) => {
  attackedSquares[Color.White].startChangeset();
  attackedSquares[Color.Black].startChangeset();

  const opponentColor = flipColor(movedPiece.color);

  attackedSquares[movedPiece.color].removeAttacksForPiece(move.from);
  attackedSquares[movedPiece.color].removeAttacksForPiece(move.to);
  attackedSquares[opponentColor].removeAttacksForPiece(move.to);

  // Find the squares that are now attacked by the moved piece.
  const newAttacks: SquareControlObject[] = forPiece(
    movedPiece,
    pieces,
    move.to
  );
  attackedSquares[movedPiece.color].addAttacksForPiece(move.to, newAttacks);

  // Find sliding pieces affected by the moved piece.
  for (const [square, piece] of pieces) {
    if (square === move.from || square === move.to || !isSlider(piece.type)) {
      // We have already covered pieces in the move from/to squares or this
      // piece is not a slider.
      continue;
    }

    const isIncidentFrom = sliderHasVision(piece, square, move.from);
    const isIncidentTo = sliderHasVision(piece, square, move.to);

    // If the sliding piece is incident with a move's from and two squares in
    // the same ray we need special handling. If the move's to square is
    // further from the sliding piece we need to add attacks and if it is
    // closed to the sliding piece we need to remove attacks.
    if (
      isIncidentFrom &&
      isIncidentTo &&
      directionOfMove(square, move.to) === directionOfMove(square, move.from)
    ) {
      const unit = directionOfMove(square, move.from);
      const ray = RAY_BY_DIRECTION[piece.type][square][unit];

      const moveUnit = directionOfMove(move.from, move.to);

      if (unit === moveUnit) {
        // The to square is further away so we add attacks.
        const newSquaresControlled = rayControlScanner(
          pieces,
          { square, piece },
          ray,
          move.from
        );
        attackedSquares[piece.color].addAttacks(square, newSquaresControlled);
      } else {
        // The to square is closer so we remove attacks.
        const squaresNoLongerControlled = rayControlScanner(
          pieces,
          { square, piece },
          ray,
          move.to
        );
        attackedSquares[piece.color].removeAttacks(
          square,
          squaresNoLongerControlled
        );
      }
    } else {
      // For the the square the piece has moved from.
      // - The square no longer has a piece in it and a ray which was
      //   obstructed is no longer obstructed, therefore we want to add attacks.
      if (isIncidentFrom) {
        const unit = directionOfMove(square, move.from);
        const ray = RAY_BY_DIRECTION[piece.type][square][unit];
        const newSquaresControlled = rayControlScanner(
          pieces,
          { square, piece },
          ray,
          move.from
        );

        attackedSquares[piece.color].addAttacks(square, newSquaresControlled);
      }

      // For the square the piece has moved to.
      // - If the move was a capture nothing in the attack map should change
      //   relative to the to square since a piece occupied it before.
      // - Otherwise the to square now has a piece in it and a ray can now be
      //   obstructed, therefore we want to remove attacks.
      if (!isCapture && isIncidentTo) {
        const unit = directionOfMove(square, move.to);
        const ray = RAY_BY_DIRECTION[piece.type][square][unit];
        const squaresNoLongerControlled = rayControlScanner(
          pieces,
          { square, piece },
          ray,
          move.to
        );

        attackedSquares[piece.color].removeAttacks(
          square,
          squaresNoLongerControlled
        );
      }
    }
  }
};
