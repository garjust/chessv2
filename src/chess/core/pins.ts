import { Color, Move, Piece, PieceType, Pin, Square } from '../types';
import { directionOfMove } from '../utils';
import {
  KING_RAYS,
  QUEEN_RAY_BITARRAYS,
  RAY_BY_DIRECTION,
} from './lookup-moves/move-lookup';
import { KingSquares, PinsByColor } from './types';

export const updatePinsOnKings = (
  pinsByColor: PinsByColor,
  pieces: Map<Square, Piece>,
  kings: KingSquares,
  move: Move,
  piece: Piece,
) => {
  for (const color of [Color.White, Color.Black]) {
    pinsByColor[color].startUpdates();
    const king = kings[color];
    if (king) {
      if (
        // If the moved piece is the king, recalcuate all pins on it.
        piece.type === PieceType.King
      ) {
        pinsByColor[color].reset(pieces, king, color);
      } else if (
        // If the move from square interacts with any king ray we may need
        // to remove or add a pin.
        QUEEN_RAY_BITARRAYS[king][move.from]
      ) {
        // const unit = directionOfMove(king, move.from);
        // const ray = RAY_BY_DIRECTION[PieceType.Queen][king][unit];

        pinsByColor[color].reset(pieces, king, color);
      } else if (
        // If the move to square interacts with any king ray we may need
        // to remove or add a pin.
        QUEEN_RAY_BITARRAYS[king][move.to]
      ) {
        pinsByColor[color].reset(pieces, king, color);
      }
    }
  }
};

enum UpdateType {
  AddPin,
  RemovePin,
  Reset,
}

type Update =
  | { type: UpdateType.AddPin; square: Square }
  | { type: UpdateType.RemovePin; pin: Pin }
  | { type: UpdateType.Reset; map: Map<Square, Pin> };

export default class Pins {
  _map = new Map<Square, Pin>();

  _updatesStack: Update[][] = [];

  constructor(
    pieces: Map<Square, Piece>,
    kingSquare: Square | undefined,
    color: Color,
  ) {
    if (!kingSquare) {
      return;
    }
    this.reset(pieces, kingSquare, color, false);
  }

  startUpdates(): void {
    this._updatesStack.push([]);
  }

  revert(): void {
    const updates = this._updatesStack.pop() ?? [];
    for (const change of updates) {
      switch (change.type) {
        case UpdateType.AddPin:
          this.remove(change.square, false);
          break;
        case UpdateType.RemovePin:
          this.add(change.pin, false);
          break;
        case UpdateType.Reset:
          this._map = change.map;
          break;
      }
    }
  }

  add(pin: Pin, cache = true) {
    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: UpdateType.AddPin,
        square: pin.pinned,
      });
    }
    this._map.set(pin.pinned, pin);
  }

  remove(square: Square, cache = true) {
    const pin = this._map.get(square);
    if (!pin) {
      throw Error('cannot remove no pin');
    }

    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: UpdateType.RemovePin,
        pin,
      });
    }
    this._map.delete(square);
  }

  reset(
    pieces: Map<Square, Piece>,
    kingSquare: Square,
    color: Color,
    cache = true,
  ) {
    if (cache) {
      this._updatesStack[this._updatesStack.length - 1].push({
        type: UpdateType.Reset,
        map: this._map,
      });
    }

    this._map = new Map<Square, Pin>();

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
