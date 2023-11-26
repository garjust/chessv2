import { Color, Move, Piece, PieceType, Pin, Square } from '../types';
import { directionOfMove } from '../utils';
import { BISHOP_RAYS, ROOK_RAYS, QUEEN_MOVE_BITARRAYS } from './lookup';

const walkRay = (
  pieces: Map<Square, Piece>,
  pieceType: PieceType,
  color: Color,
  ray: number[],
): Pin | null => {
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
    openSquares.push(friendlySquare);
    // With exactly one piece this is a standard pin to the king, which is
    // what we care about for move generation.
    return {
      to: friendlySquare,
      from: opponentSquare,
      direction: directionOfMove(opponentSquare, friendlySquare),
      legalMoveSquares: openSquares,
    };
  }

  return null;
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
  private map = new Map<Square, Pin>();

  private readonly color: Color;
  private readonly updatesStack: Update[][] = [];

  constructor(
    pieces: Map<Square, Piece>,
    toSquare: Square | undefined,
    color: Color,
  ) {
    this.color = color;
    if (toSquare) {
      this.reset(pieces, toSquare, false);
    }
  }

  /**
   * Return a pin object if it exists where the pinned piece resides on the
   * given square.
   */
  pinByPinnedPiece(square: Square): Pin | undefined {
    return this.map.get(square);
  }

  get allPins() {
    return Array.from(this.map.values());
  }

  /**
   * Run an update of pin state.
   */
  update(
    pieces: Map<Square, Piece>,
    move: Move,
    piece: Piece,
    toSquare?: Square,
  ) {
    this.updatesStack.push([]);

    // If the square we are examining for pins is not set don't do any actual
    // updates.
    // $$$ TODO: should probably wipe the pins?
    if (toSquare === undefined) {
      return;
    }

    if (piece.type === PieceType.King) {
      // If the moved piece is the king, recalcuate all pins on it.
      this.reset(pieces, toSquare);
    } else if (QUEEN_MOVE_BITARRAYS[toSquare][move.from]) {
      // If the move from square interacts with any king ray we may need
      // to remove or add a pin.
      this.reset(pieces, toSquare);
    } else if (QUEEN_MOVE_BITARRAYS[toSquare][move.to]) {
      // If the move to square interacts with any king ray we may need
      // to remove or add a pin.
      this.reset(pieces, toSquare);
    }
  }

  revert(): void {
    const updates = this.updatesStack.pop() ?? [];
    for (const change of updates) {
      switch (change.type) {
        case UpdateType.AddPin:
          this.remove(change.square, false);
          break;
        case UpdateType.RemovePin:
          this.add(change.pin, false);
          break;
        case UpdateType.Reset:
          this.map = change.map;
          break;
      }
    }
  }

  private add(pin: Pin, cache = true) {
    if (cache) {
      this.updatesStack[this.updatesStack.length - 1].push({
        type: UpdateType.AddPin,
        square: pin.to,
      });
    }
    this.map.set(pin.to, pin);
  }

  private remove(square: Square, cache = true) {
    const pin = this.map.get(square);
    if (!pin) {
      throw Error('cannot remove no pin');
    }

    if (cache) {
      this.updatesStack[this.updatesStack.length - 1].push({
        type: UpdateType.RemovePin,
        pin,
      });
    }
    this.map.delete(square);
  }

  private reset(pieces: Map<Square, Piece>, kingSquare: Square, cache = true) {
    if (cache) {
      this.updatesStack[this.updatesStack.length - 1].push({
        type: UpdateType.Reset,
        map: this.map,
      });
    }

    this.map = new Map<Square, Pin>();

    for (const ray of BISHOP_RAYS[kingSquare]) {
      const pin = walkRay(pieces, PieceType.Bishop, this.color, ray);
      if (pin !== null) {
        this.map.set(pin.to, pin);
      }
    }
    for (const ray of ROOK_RAYS[kingSquare]) {
      const pin = walkRay(pieces, PieceType.Rook, this.color, ray);
      if (pin !== null) {
        this.map.set(pin.to, pin);
      }
    }
  }
}
