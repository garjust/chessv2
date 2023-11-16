import {
  BISHOP_LOOKUP,
  QUEEN_LOOKUP,
  ROOK_LOOKUP,
  SUPER_PIECE_LOOKUP,
} from './move-lookup';

/**
 * For each square a bitarray representing squares that a bishop can move to
 * on an empty board.
 * This allows array index lookup (square as index) to determine
 * if a square intersects any of the bishop's movement.
 */
export const BISHOP_MOVE_BITARRAYS: boolean[][] = BISHOP_LOOKUP.map((raySet) =>
  raySet.flat(),
).map((squares) => {
  const array = Array<boolean>(64);
  squares.forEach((x) => (array[x] = true));
  return array;
});

/**
 * For each square a bitarray representing squares that a rook can move to
 * on an empty board.
 * This allows array index lookup (square as index) to determine
 * if a square intersects any of the rook's movement.
 */
export const ROOK_MOVE_BITARRAYS: boolean[][] = ROOK_LOOKUP.map((raySet) =>
  raySet.flat(),
).map((squares) => {
  const array = Array<boolean>(64);
  squares.forEach((x) => (array[x] = true));
  return array;
});

/**
 * For each square a bitarray representing squares that a queen can move to
 * on an empty board.
 * This allows array index lookup (square as index) to determine
 * if a square intersects any of the queen's movement.
 */
export const QUEEN_MOVE_BITARRAYS: boolean[][] = QUEEN_LOOKUP.map((raySet) =>
  raySet.flat(),
).map((squares) => {
  const array = Array<boolean>(64);
  squares.forEach((x) => (array[x] = true));
  return array;
});

/**
 * For each square a bitarray representing squares that a "super piece"
 * can move to on an empty board.
 * This allows array index lookup (square as index) to determine
 * if a square intersects any of the super piece's squares.
 */
export const SUPER_MOVE_BITARRAYS: boolean[][] = SUPER_PIECE_LOOKUP.map(
  (squares) => {
    const array = Array<boolean>(64);
    squares.forEach((x) => (array[x] = true));
    return array;
  },
);
