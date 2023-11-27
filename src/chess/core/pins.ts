import {
  Color,
  DirectionUnit,
  Move,
  Piece,
  PieceType,
  Pin,
  Square,
} from '../types';
import { sliderType } from '../utils';
import {
  BISHOP_RAYS,
  ROOK_RAYS,
  QUEEN_MOVE_BITARRAYS,
  RAYS_BY_DIRECTION,
} from './lookup';
import { directionOfMove, flipDirection } from './move-utils';

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

  // Check if we found a pin!
  if (friendlySquare !== null && opponentSquare !== null) {
    openSquares.push(friendlySquare);
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
  Reset,
  RayUpdate,
}

type Update =
  | { type: UpdateType.RayUpdate; direction: DirectionUnit; pin?: Pin }
  | { type: UpdateType.Reset; map: Map<DirectionUnit, Pin>; toSquare?: Square };

/**
 * Manages pieces that are currently pinned.
 *
 * A piece P is pinned if an opponent's piece P_a is attacking P and would be
 * attacking another piece P' if P moves out of P_a's attacking ray.
 *
 * A pin where P' is a king is called an **absolute pin** and is what the chess
 * core is primarily concerned with for move generation purposes.
 */
export default class Pins {
  private map = new Map<DirectionUnit, Pin>();
  private toSquare?: Square;

  private readonly color: Color;
  private readonly updatesStack: Update[][] = [];

  constructor(
    pieces: Map<Square, Piece>,
    toSquare: Square | undefined,
    color: Color,
  ) {
    this.color = color;
    this.toSquare = toSquare;
    this.reset(pieces, toSquare, false);
  }

  /**
   * Return a pin object if it exists where the pinned piece resides on the
   * given square.
   *
   * The following must be true for a piece P to be absolutely pinned:
   * - An opposing player's piece P_a must have control of P's resident square.
   * - P_a must be a sliding piece
   * - P_a's attacking ray can be extended into the player's king K.
   * - The player has no other pieces in the squares between P and K.
   *
   * If P is also a sliding piece and is able to move along P_a's attacking ray
   * then P is considered to be "partially pinned" since it can capture P_a or
   * possibly move along the attacking ray.
   */
  pinByPinnedPiece(square: Square): Pin | undefined {
    // First check if the square intersects a queen ray. If not there cannot be
    // a pin.
    if (!this.toSquare || !QUEEN_MOVE_BITARRAYS[this.toSquare][square]) {
      return;
    }

    // If the square intersects then look for a pin in the corresponding ray
    const pin = this.map.get(directionOfMove(square, this.toSquare));
    if (pin !== undefined && pin.to === square) {
      return pin;
    }
    return;
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
    toSquare?: Square,
    castlingRookMove?: Move,
  ) {
    this.updatesStack.push([]);

    if (toSquare !== this.toSquare) {
      // The square we are calculating pins to has changed so recalculate all
      // pins.
      this.reset(pieces, toSquare);
    } else if (toSquare === undefined) {
      // The square we are calculating pins to is undefined and has not changed
      // so don't actually do any actual updates.
      return;
    } else {
      const raysToUpdate = new Set<DirectionUnit>();
      // If any squares involved with the move intersect a queen ray originating
      // at toSquare we may need to add or remove pins.
      if (QUEEN_MOVE_BITARRAYS[toSquare][move.from]) {
        raysToUpdate.add(directionOfMove(move.from, toSquare));
      }
      if (QUEEN_MOVE_BITARRAYS[toSquare][move.to]) {
        raysToUpdate.add(directionOfMove(move.to, toSquare));
      }
      if (castlingRookMove !== undefined) {
        if (QUEEN_MOVE_BITARRAYS[toSquare][castlingRookMove.from]) {
          raysToUpdate.add(directionOfMove(castlingRookMove.from, toSquare));
        }
        if (QUEEN_MOVE_BITARRAYS[toSquare][castlingRookMove.to]) {
          raysToUpdate.add(directionOfMove(castlingRookMove.to, toSquare));
        }
      }

      for (const direction of raysToUpdate) {
        this.updateRay(pieces, direction, toSquare);
      }
    }
  }

  revert(): void {
    const updates = this.updatesStack.pop() ?? [];
    for (const change of updates) {
      switch (change.type) {
        case UpdateType.RayUpdate:
          if (change.pin) {
            this.map.set(change.direction, change.pin);
          } else {
            this.map.delete(change.direction);
          }
          break;
        case UpdateType.Reset:
          this.map = change.map;
          this.toSquare = change.toSquare;
          break;
      }
    }
  }

  private updateRay(
    pieces: Map<Square, Piece>,
    direction: DirectionUnit,
    toSquare: Square,
    cache = true,
  ) {
    const currentPin = this.map.get(direction);
    const ray = RAYS_BY_DIRECTION[toSquare][flipDirection(direction)];
    const pin = walkRay(pieces, sliderType(direction), this.color, ray);

    if (cache) {
      this.updatesStack[this.updatesStack.length - 1].push({
        type: UpdateType.RayUpdate,
        direction,
        pin: currentPin,
      });
    }

    if (pin !== null) {
      this.map.set(direction, pin);
    } else {
      this.map.delete(direction);
    }
  }

  private reset(pieces: Map<Square, Piece>, toSquare?: Square, cache = true) {
    if (cache) {
      this.updatesStack[this.updatesStack.length - 1].push({
        type: UpdateType.Reset,
        map: this.map,
        toSquare: this.toSquare,
      });
    }

    this.map = new Map<Square, Pin>();
    this.toSquare = toSquare;

    // If the square we are examining for pins is undefined don't try and walk
    // any rays.
    if (toSquare === undefined) {
      return;
    }

    for (const ray of BISHOP_RAYS[toSquare]) {
      const pin = walkRay(pieces, PieceType.Bishop, this.color, ray);
      if (pin !== null) {
        this.map.set(pin.direction, pin);
      }
    }
    for (const ray of ROOK_RAYS[toSquare]) {
      const pin = walkRay(pieces, PieceType.Rook, this.color, ray);
      if (pin !== null) {
        this.map.set(pin.direction, pin);
      }
    }
  }
}
