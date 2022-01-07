import { Color, Move, Piece, PieceType, Pin, Square } from '../types';
import { flipColor } from '../utils';
import { KING_RAYS, QUEEN_RAY_BITARRAYS } from './move-lookup';
import { KingSquares, KingPins } from './types';

const pinsToSquare = (
  pieces: Map<Square, Piece>,
  square: Square,
  color: Color
) => {
  const pins = new Map<Square, Pin>();
  const rays = KING_RAYS[square];

  for (const { type, ray } of rays) {
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

    if (
      opponentPiece &&
      (opponentPiece.piece.type === type ||
        opponentPiece.piece.type === PieceType.Queen)
    ) {
      // We found a pin or sliding attack on the king!
      if (friendlyPieces.length === 1) {
        // With exactly one piece this is a standard pin to the king, which is
        // what we care about for move generation.
        pins.set(friendlyPieces[0], {
          pinned: friendlyPieces[0],
          attacker: opponentPiece.square,
          legalMoveSquares: [...openSquares, ...friendlyPieces],
        });
      }
    }
  }

  return pins;
};

export const findPinsOnKings = (
  pieces: Map<Square, Piece>,
  kings: KingSquares
): KingPins => {
  const whiteKing = kings[Color.White];
  const blackKing = kings[Color.Black];

  let whitePins;
  let blackPins;

  if (whiteKing) {
    whitePins = pinsToSquare(pieces, whiteKing, Color.White);
  }
  if (blackKing) {
    blackPins = pinsToSquare(pieces, blackKing, Color.Black);
  }

  return {
    [Color.White]: whitePins ? whitePins : new Map<Square, Pin>(),
    [Color.Black]: blackPins ? blackPins : new Map<Square, Pin>(),
  };
};

export const updatePinsOnKings = (
  pins: KingPins,
  pieces: Map<Square, Piece>,
  kings: KingSquares,
  currentMove: Color,
  move: Move,
  piece: Piece
) => {
  const playingKing = kings[currentMove];
  const opponentKing = kings[flipColor(currentMove)];

  if (playingKing) {
    // If the moved piece is the king, recalcuate pins on it.
    //
    // If the moved piece does not enter or leave the king's rays nothing
    // needs to be computed.
    if (
      piece.type === PieceType.King ||
      QUEEN_RAY_BITARRAYS[playingKing][move.from] ||
      QUEEN_RAY_BITARRAYS[playingKing][move.to]
    ) {
      pins[currentMove] = pinsToSquare(pieces, playingKing, currentMove);
    }
  }

  if (opponentKing) {
    // If the moved piece is the king, recalcuate pins on it.
    //
    // If the moved piece does not enter or leave the king's rays nothing
    // needs to be computed.
    if (
      piece.type === PieceType.King ||
      QUEEN_RAY_BITARRAYS[opponentKing][move.from] ||
      QUEEN_RAY_BITARRAYS[opponentKing][move.to]
    ) {
      pins[flipColor(currentMove)] = pinsToSquare(
        pieces,
        opponentKing,
        flipColor(currentMove)
      );
    }
  }
};
