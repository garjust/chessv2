import { Color, Move, Piece, PieceType, Pin, Square } from '../types';
import { BISHOP_RAYS, ROOK_RAYS, QUEEN_MOVE_BITARRAYS } from './lookup';
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
        QUEEN_MOVE_BITARRAYS[king][move.from]
      ) {
        // const unit = directionOfMove(king, move.from);
        // const ray = RAY_BY_DIRECTION[PieceType.Queen][king][unit];

        pinsByColor[color].reset(pieces, king, color);
      } else if (
        // If the move to square interacts with any king ray we may need
        // to remove or add a pin.
        QUEEN_MOVE_BITARRAYS[king][move.to]
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

  private walkRays(
    pieces: Map<Square, Piece>,
    pieceType: PieceType,
    color: Color,
    rays: number[][],
  ) {
    for (const ray of rays) {
      // looking for a friendly piece then an opponent's slider.
      const openSquares: Square[] = [];
      let friendlySquare: Square | null = null;
      let opponentSquare: Square | null = null;

      for (const square of ray) {
        const piece = pieces.get(square);
        if (piece) {
          if (piece.color === color) {
            if (friendlySquare === null) {
              friendlySquare = square;
            } else {
              // Found a second friendly piece, so there is no pin.
              friendlySquare = null;
              break;
            }
          } else {
            // Found an opponent's piece. Check if it is the right type
            // for the ray.
            if (piece.type === pieceType || piece.type === PieceType.Queen) {
              opponentSquare = square;
            }
            break;
          }
        } else {
          openSquares.push(square);
        }
      }

      // Check if we found a pin on the king!
      if (friendlySquare !== null && opponentSquare !== null) {
        // Mutate the array since it is re-initialized after this.
        openSquares.push(friendlySquare);
        // With exactly one piece this is a standard pin to the king, which is
        // what we care about for move generation.
        this._map.set(friendlySquare, {
          pinned: friendlySquare,
          attacker: opponentSquare,
          legalMoveSquares: openSquares,
        });
      }
    }
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

    this.walkRays(pieces, PieceType.Bishop, color, BISHOP_RAYS[kingSquare]);
    this.walkRays(pieces, PieceType.Rook, color, ROOK_RAYS[kingSquare]);
  }

  pinByPinnedPiece(square: Square): Pin | undefined {
    return this._map.get(square);
  }

  get allPins() {
    return Array.from(this._map.values());
  }
}
