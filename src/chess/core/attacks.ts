import {
  Color,
  Piece,
  PieceType,
  Square,
  Move,
  SquareControl,
  SlidingPiece,
  MoveWithExtraData,
} from '../types';
import { flipColor, isSlider } from '../utils';
import {
  BISHOP_MOVE_BITARRAYS,
  ROOK_MOVE_BITARRAYS,
  QUEEN_MOVE_BITARRAYS,
  RAY_MOVES_BY_DIRECTION,
} from './lookup';
import { directionOfMove, rayControlScanner } from './move-utils';
import { controlForPiece } from './piece-movement';
import { SquareControlByColor } from './types';
import SquareControlMap from './square-control-map';
import { PIECES } from './lookup';

const sliderHasVision = (piece: Piece, pieceSquare: Square, square: Square) => {
  switch (piece.type) {
    case PieceType.Bishop:
      return BISHOP_MOVE_BITARRAYS[pieceSquare][square];
    case PieceType.Rook:
      return ROOK_MOVE_BITARRAYS[pieceSquare][square];
    case PieceType.Queen:
      return QUEEN_MOVE_BITARRAYS[pieceSquare][square];
    default:
      return false;
  }
};

const updatePiecesAttacks = (
  square: Square,
  piece: SlidingPiece,
  attackMap: SquareControlMap,
  pieces: Map<Square, Piece>,
  move: Move,
  isCapture: boolean,
  enPassantCaptureSquare?: Square,
  castlingRookMove?: Move,
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
    const newAttacks: SquareControl[] = controlForPiece(piece, pieces, square);
    attackMap.addAttacksForPiece(square, newAttacks);
  } else if (
    // If the sliding piece is incident with a move's from and two squares in
    // the same ray we need special handling. If the move's to square is
    // further from the sliding piece we need to add attacks and if it is
    // closer to the sliding piece we need to remove attacks.
    isIncidentFrom &&
    isIncidentTo &&
    directionOfMove(square, move.to) === directionOfMove(square, move.from)
  ) {
    const unit = directionOfMove(square, move.from);
    const ray = (
      RAY_MOVES_BY_DIRECTION[piece.color][square][
        piece.type
      ] as unknown as MoveWithExtraData[][]
    )[unit];

    const moveUnit = directionOfMove(move.from, move.to);

    if (unit === moveUnit) {
      // The to square is further away so we add attacks.
      const newSquaresControlled = rayControlScanner(pieces, ray, move.from);
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
        ray,
        move.to,
        move.from,
      );
      attackMap.removeAttacks(square, squaresNoLongerControlled);
    }
  } else {
    // For the the square the piece has moved from.
    // - The square no longer has a piece in it and a ray which was
    //   obstructed is no longer obstructed, therefore we want to add attacks.
    if (isIncidentFrom) {
      const unit = directionOfMove(square, move.from);
      const ray = (
        RAY_MOVES_BY_DIRECTION[piece.color][square][
          piece.type
        ] as unknown as MoveWithExtraData[][]
      )[unit];
      const newSquaresControlled = rayControlScanner(pieces, ray, move.from);

      attackMap.addAttacks(square, newSquaresControlled);
    }

    // For the square the piece has moved to.
    // - If the move was a capture nothing in the attack map should change
    //   relative to the to square since a piece occupied it before.
    // - Otherwise the to square now has a piece in it and a ray can now be
    //   obstructed, therefore we want to remove attacks.
    if (!isCapture && isIncidentTo) {
      const unit = directionOfMove(square, move.to);
      const ray = (
        RAY_MOVES_BY_DIRECTION[piece.color][square][
          piece.type
        ] as unknown as MoveWithExtraData[][]
      )[unit];
      const squaresNoLongerControlled = rayControlScanner(pieces, ray, move.to);

      attackMap.removeAttacks(square, squaresNoLongerControlled);
    }
  }
};

const squaresControllingSquare = (
  controlledSquare: Square,
  squareControlByColor: SquareControlByColor,
) => {
  const squares = new Set<Square>();

  for (const [square] of squareControlByColor[Color.White].controlOfSquare(
    controlledSquare,
  )) {
    squares.add(square);
  }
  for (const [square] of squareControlByColor[Color.Black].controlOfSquare(
    controlledSquare,
  )) {
    squares.add(square);
  }
  return squares;
};

const squaresControllingMoveSquares = (
  move: Move,
  squareControlByColor: SquareControlByColor,
) => {
  const squares = new Set<Square>();
  for (const [square] of squareControlByColor[Color.White].controlOfSquare(
    move.from,
  )) {
    squares.add(square);
  }
  for (const [square] of squareControlByColor[Color.Black].controlOfSquare(
    move.from,
  )) {
    squares.add(square);
  }
  for (const [square] of squareControlByColor[Color.White].controlOfSquare(
    move.to,
  )) {
    squares.add(square);
  }
  for (const [square] of squareControlByColor[Color.Black].controlOfSquare(
    move.to,
  )) {
    squares.add(square);
  }
  return squares;
};

export const updateSquareControlMapForMove = (
  pieces: Map<Square, Piece>,
  map: SquareControlMap,
  piece: Piece,
  move: Move,
) => {
  map.removeAttacksForPiece(move.from);
  map.removeAttacksForPiece(move.to);

  // Find the squares that are now attacked by the moved piece.
  const newAttacks: SquareControl[] = controlForPiece(piece, pieces, move.to);
  map.addAttacksForPiece(move.to, newAttacks);
};

export const updateSquareControlMaps = (
  squareControlByColor: SquareControlByColor,
  pieces: Map<Square, Piece>,
  move: Move,
  movedPiece: Piece,
  isCapture: boolean,
  enPassantCaptureSquare?: Square,
  castlingRookMove?: Move,
) => {
  squareControlByColor[Color.White].startUpdates();
  squareControlByColor[Color.Black].startUpdates();

  const opponentColor = flipColor(movedPiece.color);
  squareControlByColor[opponentColor].removeAttacksForPiece(move.to);

  updateSquareControlMapForMove(
    pieces,
    squareControlByColor[movedPiece.color],
    movedPiece,
    move,
  );
  if (castlingRookMove) {
    updateSquareControlMapForMove(
      pieces,
      squareControlByColor[movedPiece.color],
      PIECES[movedPiece.color][PieceType.Rook],
      castlingRookMove,
    );
  }

  // Find pieces possibly affected by the moved piece.
  const squares = squaresControllingMoveSquares(move, squareControlByColor);

  if (enPassantCaptureSquare) {
    squareControlByColor[opponentColor].removeAttacksForPiece(
      enPassantCaptureSquare,
    );
    const enPassantSquareSquares = squaresControllingSquare(
      enPassantCaptureSquare,
      squareControlByColor,
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
      squareControlByColor[piece.color],
      pieces,
      move,
      isCapture,
      enPassantCaptureSquare,
      castlingRookMove,
    );
  }
};
