import { Color, Move, Piece, PieceType, Pin, Square } from '../types';
import { KING_RAYS, QUEEN_RAY_BITARRAYS } from './move-lookup';
import { KingSquares, PinsByColor } from './types';

export const updatePinsOnKings = (
  pins: PinsByColor,
  pieces: Map<Square, Piece>,
  kings: KingSquares,
  move: Move,
  piece: Piece
) => {
  const whiteKing = kings[Color.White];
  const blackKing = kings[Color.Black];

  if (whiteKing) {
    // If the moved piece is the king, recalcuate pins on it.
    //
    // If the moved piece does not enter or leave the king's rays nothing
    // needs to be computed.
    if (
      piece.type === PieceType.King ||
      QUEEN_RAY_BITARRAYS[whiteKing][move.from] ||
      QUEEN_RAY_BITARRAYS[whiteKing][move.to]
    ) {
      pins[Color.White] = new Pins(pieces, whiteKing, Color.White);
    }
  }

  if (blackKing) {
    // If the moved piece is the king, recalcuate pins on it.
    //
    // If the moved piece does not enter or leave the king's rays nothing
    // needs to be computed.
    if (
      piece.type === PieceType.King ||
      QUEEN_RAY_BITARRAYS[blackKing][move.from] ||
      QUEEN_RAY_BITARRAYS[blackKing][move.to]
    ) {
      pins[Color.Black] = new Pins(pieces, blackKing, Color.Black);
    }
  }
};

export default class Pins {
  _map = new Map<Square, Pin>();

  constructor(
    pieces: Map<Square, Piece>,
    kingSquare: Square | undefined,
    color: Color
  ) {
    if (!kingSquare) {
      return;
    }

    const rays = KING_RAYS[kingSquare];

    for (const { type, ray } of rays) {
      // looking for a friendly piece then an opponent's slider.
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
          this._map.set(friendlyPieces[0], {
            pinned: friendlyPieces[0],
            attacker: opponentPiece.square,
            legalMoveSquares: [...openSquares, ...friendlyPieces],
          });
        }
      }
    }
  }

  pinByPinnedPiece(square: Square): Pin | undefined {
    return this._map.get(square);
  }

  get allPins() {
    return Array.from(this._map.values());
  }
}
