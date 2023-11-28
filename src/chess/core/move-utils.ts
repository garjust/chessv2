import {
  BishopDirection,
  DirectionUnit,
  Move,
  MoveWithExtraData,
  Piece,
  RookDirection,
  Square,
  SquareControl,
} from '../types';
import {
  PROMOTION_OPTION_PIECE_TYPES,
  isSlider,
  rankForSquare,
} from '../utils';

export const buildMove = (from: number, to: number): Move => ({
  from: from as Square,
  to: to as Square,
});

export const isMoveUp = (move: Move): boolean =>
  move.from < move.to && isMoveInFile(move);

export const isMoveDown = (move: Move): boolean =>
  move.from > move.to && isMoveInFile(move);

export const isMoveInFile = (move: Move): boolean =>
  (move.from - move.to) % 8 === 0;

export const flipDirection = (direction: DirectionUnit): DirectionUnit =>
  direction * -1;

export const directionOfMove = (from: Square, to: Square): DirectionUnit => {
  const diff = to - from;
  const fromRank = rankForSquare(from);

  if (from === 0 && to === 63) {
    return DirectionUnit.UpRight;
  }

  if (diff > 0) {
    if (diff % DirectionUnit.Up === 0) {
      return DirectionUnit.Up;
    } else if (diff % DirectionUnit.UpLeft === 0) {
      if (fromRank === 0) {
        return DirectionUnit.Right;
      } else {
        return DirectionUnit.UpLeft;
      }
    } else if (diff % DirectionUnit.UpRight === 0) {
      return DirectionUnit.UpRight;
    } else {
      return DirectionUnit.Right;
    }
  } else {
    if (diff % DirectionUnit.Down === 0) {
      return DirectionUnit.Down;
    } else if (diff % DirectionUnit.DownLeft === 0) {
      return DirectionUnit.DownLeft;
    } else if (diff % DirectionUnit.DownRight === 0) {
      if (fromRank === 7) {
        return DirectionUnit.Left;
      } else {
        return DirectionUnit.DownRight;
      }
    } else {
      return DirectionUnit.Left;
    }
  }
};

export const isBishopDirection = (
  direction: DirectionUnit,
): direction is BishopDirection =>
  direction === DirectionUnit.UpLeft ||
  direction === DirectionUnit.UpRight ||
  direction === DirectionUnit.DownLeft ||
  direction === DirectionUnit.DownRight;

export const isRookDirection = (
  direction: DirectionUnit,
): direction is RookDirection => !isBishopDirection(direction);

export const moveEquals = (a: Nullable<Move>, b: Nullable<Move>): boolean =>
  Boolean(a && b && a.from === b.from && a.to === b.to);

export const movesIncludes = (moves: Readonly<Move[]>, move: Move): boolean =>
  moves.some((x) => moveEquals(x, move));

/**
 * Return whether a SquareControl by a sliding piece intersects both squares
 * of a move.
 */
export const squareControlXraysMove = (
  squareControl: SquareControl,
  move: Move,
): boolean =>
  isSlider(squareControl.piece) &&
  directionOfMove(squareControl.from, squareControl.to) ===
    directionOfMove(move.from, move.to);

export const rayControlScanner = (
  pieces: Map<Square, Piece>,
  ray: SquareControl[],
  skipPast?: Square,
  stopAt?: Square,
): SquareControl[] => {
  const moves: SquareControl[] = [];
  let skip = skipPast !== undefined ? true : false;

  for (const control of ray) {
    if (skip) {
      if (control.to === skipPast) {
        skip = false;
      } else {
        const otherPiece = pieces.get(control.to);
        if (otherPiece) {
          // Stop scanning if we hit a piece of either colour
          break;
        }
      }

      continue;
    }

    moves.push(control);

    if (control.to === stopAt) {
      break;
    }

    const otherPiece = pieces.get(control.to);
    if (otherPiece) {
      // Stop scanning if we hit a piece of either colour
      break;
    }
  }

  return moves;
};

export const expandPromotions = (move: MoveWithExtraData) =>
  PROMOTION_OPTION_PIECE_TYPES.map((pieceType) => ({
    ...move,
    promotion: pieceType,
  }));

const rayScanForIntersection = (
  from: Square,
  toExclusive: Square, // Note: this square is exclusive in the scan since we are doing this for a check.
  intersect: Square,
): boolean => {
  const direction = directionOfMove(from, toExclusive);

  // Short cuts to avoid computing and scanning the ray.
  // if (direction === DirectionUnit.Left) {
  //   return intersect >= from && intersect < toExclusive;
  // } else if (direction === DirectionUnit.Right) {
  //   return intersect <= from && intersect > toExclusive;
  // }

  let square = from;
  do {
    if (square === intersect) {
      return true;
    }
    square += direction;
  } while (square !== toExclusive);

  return false;
};

export const isMoveIncidentWithCheck = (
  move: Move,
  check: SquareControl,
): boolean => {
  if (isSlider(check.piece)) {
    return rayScanForIntersection(check.from, check.to, move.to);
  } else {
    return check.from === move.to;
  }
};
