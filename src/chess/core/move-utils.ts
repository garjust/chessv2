import {
  DirectionUnit,
  Move,
  MoveWithExtraData,
  Piece,
  Square,
  SquareControl,
} from '../types';
import {
  PROMOTION_OPTION_PIECE_TYPES,
  directionOfMove,
  isSlider,
} from '../utils';

export const up = (square: Square, n = 1): Square => square + 8 * n;
export const down = (square: Square, n = 1): Square => square - 8 * n;
export const left = (square: Square, n = 1): Square => square - 1 * n;
export const right = (square: Square, n = 1): Square => square + 1 * n;
export const upLeft = (square: Square, n = 1): Square => square + 7 * n;
export const upRight = (square: Square, n = 1): Square => square + 9 * n;
export const downLeft = (square: Square, n = 1): Square => square - 9 * n;
export const downRight = (square: Square, n = 1): Square => square - 7 * n;

export const isMoveUp = (move: Move): boolean =>
  move.from < move.to && isMoveInFile(move);

export const isMoveDown = (move: Move): boolean =>
  move.from > move.to && isMoveInFile(move);

export const isMoveInFile = (move: Move): boolean =>
  (move.from - move.to) % 8 === 0;

export const squareControlXraysMove = (
  squareControl: SquareControl,
  move: Move,
): boolean =>
  isSlider(squareControl.piece) &&
  directionOfMove(squareControl.from, squareControl.to) ===
    directionOfMove(move.from, move.to);

export const rayControlScanner = (
  pieces: Map<Square, Piece>,
  piece: Piece,
  from: Square,
  ray: Square[],
  skipPast?: Square,
  stopAt?: Square,
): SquareControl[] => {
  const moves: SquareControl[] = [];
  let skip = skipPast !== undefined ? true : false;

  for (const to of ray) {
    if (skip) {
      if (to === skipPast) {
        skip = false;
      } else {
        const otherPiece = pieces.get(to);
        if (otherPiece) {
          // Stop scanning if we hit a piece of either colour
          break;
        }
      }

      continue;
    }

    moves.push({
      piece,
      from,
      to: to,
    });

    if (to === stopAt) {
      break;
    }

    const otherPiece = pieces.get(to);
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
  if (direction === DirectionUnit.Left) {
    return intersect >= from && intersect < toExclusive;
  } else if (direction === DirectionUnit.Right) {
    return intersect <= from && intersect > toExclusive;
  }

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
