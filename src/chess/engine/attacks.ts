import {
  Color,
  Piece,
  PieceType,
  Square,
  AttackObject,
  Move,
  SquareControlObject,
  SlidingPiece,
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
import AttackMap from './attack-map';
import { PIECES } from '../piece-consants';

export const attacksOnSquare = (
  pieces: Map<Square, Piece>,
  attackingColor: Color,
  square: Square,
  {
    enPassantSquare,
    skip,
    opponentAttackMap,
  }: {
    enPassantSquare: Square | null;
    skip: Square[];
    opponentAttackMap: AttackMap;
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
      opponentAttackMap,
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

const updatePiecesAttacks = (
  square: Square,
  piece: SlidingPiece,
  attackMap: AttackMap,
  pieces: Map<Square, Piece>,
  move: Move,
  isCapture: boolean,
  enPassantCaptureSquare?: Square,
  castlingRookMove?: Move
) => {
  const isIncidentFrom = sliderHasVision(piece, square, move.from);
  const isIncidentTo = sliderHasVision(piece, square, move.to);

  if (
    // If the move was one of these special cases do a simpler and slower
    // update to the attack map.
    enPassantCaptureSquare ||
    castlingRookMove
  ) {
    attackMap.removeAttacksForPiece(square);
    const newAttacks: SquareControlObject[] = forPiece(piece, pieces, square);
    attackMap.addAttacksForPiece(square, newAttacks);
  } else if (
    // If the sliding piece is incident with a move's from and two squares in
    // the same ray we need special handling. If the move's to square is
    // further from the sliding piece we need to add attacks and if it is
    // closed to the sliding piece we need to remove attacks.
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
      attackMap.addAttacks(square, newSquaresControlled);
    } else {
      // If the move captured a piece then there is no change to the squares
      // the slider controls since the capturing piece moved from further
      // away and the to square was occupied before the move.
      if (isCapture) {
        return;
      }

      // The to square is closer so we remove attacks.
      const squaresNoLongerControlled = rayControlScanner(
        pieces,
        { square, piece },
        ray,
        move.to,
        move.from
      );
      attackMap.removeAttacks(square, squaresNoLongerControlled);
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

      attackMap.addAttacks(square, newSquaresControlled);
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

      attackMap.removeAttacks(square, squaresNoLongerControlled);
    }
  }
};

const squaresControllingSquare = (
  controlledSquare: Square,
  attackedSquares: AttackedSquares
) => {
  const squares = new Set<Square>();

  for (const [square] of attackedSquares[Color.White].controlOfSquare(
    controlledSquare
  )) {
    squares.add(square);
  }
  for (const [square] of attackedSquares[Color.Black].controlOfSquare(
    controlledSquare
  )) {
    squares.add(square);
  }
  return squares;
};

const squaresControllingMoveSquares = (
  move: Move,
  attackedSquares: AttackedSquares
) => {
  const squares = new Set<Square>();
  for (const [square] of attackedSquares[Color.White].controlOfSquare(
    move.from
  )) {
    squares.add(square);
  }
  for (const [square] of attackedSquares[Color.Black].controlOfSquare(
    move.from
  )) {
    squares.add(square);
  }
  for (const [square] of attackedSquares[Color.White].controlOfSquare(
    move.to
  )) {
    squares.add(square);
  }
  for (const [square] of attackedSquares[Color.Black].controlOfSquare(
    move.to
  )) {
    squares.add(square);
  }
  return squares;
};

export const updateAttackedSquaresForMove = (
  pieces: Map<Square, Piece>,
  map: AttackMap,
  piece: Piece,
  move: Move
) => {
  map.removeAttacksForPiece(move.from);
  map.removeAttacksForPiece(move.to);

  // Find the squares that are now attacked by the moved piece.
  const newAttacks: SquareControlObject[] = forPiece(piece, pieces, move.to);
  map.addAttacksForPiece(move.to, newAttacks);
};

export const updateAttackedSquares = (
  attackedSquares: AttackedSquares,
  pieces: Map<Square, Piece>,
  move: Move,
  movedPiece: Piece,
  isCapture: boolean,
  enPassantCaptureSquare?: Square,
  castlingRookMove?: Move
) => {
  attackedSquares[Color.White].startChangeset();
  attackedSquares[Color.Black].startChangeset();

  const opponentColor = flipColor(movedPiece.color);
  attackedSquares[opponentColor].removeAttacksForPiece(move.to);

  updateAttackedSquaresForMove(
    pieces,
    attackedSquares[movedPiece.color],
    movedPiece,
    move
  );
  if (castlingRookMove) {
    updateAttackedSquaresForMove(
      pieces,
      attackedSquares[movedPiece.color],
      PIECES[movedPiece.color][PieceType.Rook],
      castlingRookMove
    );
  }

  // Find pieces possibly affected by the moved piece.
  const squares = squaresControllingMoveSquares(move, attackedSquares);

  if (enPassantCaptureSquare) {
    attackedSquares[opponentColor].removeAttacksForPiece(
      enPassantCaptureSquare
    );
    const enPassantSquareSquares = squaresControllingSquare(
      enPassantCaptureSquare,
      attackedSquares
    );
    for (const square of enPassantSquareSquares) {
      squares.add(square);
    }
  }

  for (const square of squares) {
    // Already updated the castled rook.
    if (
      castlingRookMove &&
      (square === castlingRookMove.from || square === castlingRookMove.to)
    ) {
      continue;
    }

    const piece = pieces.get(square);
    if (!piece) {
      throw Error('there should be a piece');
    }
    if (square === move.from || square === move.to || !isSlider(piece)) {
      // We have already covered pieces in the move from/to squares or this
      // piece is not a slider.
      continue;
    }

    updatePiecesAttacks(
      square,
      piece,
      attackedSquares[piece.color],
      pieces,
      move,
      isCapture,
      enPassantCaptureSquare,
      castlingRookMove
    );
  }
};
