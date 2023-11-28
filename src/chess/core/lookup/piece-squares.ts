import { Square } from '../../types';
import { squareGenerator } from '../../utils';
import { kingMoves, knightMoves } from './movement';
import { BishopRays, RookRays, bishopRays, rookRays } from './rays';

/** All rays by direction starting at the indexed square. */
const RAYS_BY_DIRECTION: Array<BishopRays & RookRays> = [];

const KING_LOOKUP: Square[][] = [];
const KNIGHT_LOOKUP: Square[][] = [];
const SUPER_PIECE_LOOKUP: Square[][] = [];

/** Array of bishop rays starting at the indexed square. */
const BISHOP_RAYS: Square[][][] = [];

/** Array of rook rays starting at the indexed square. */
const ROOK_RAYS: Square[][][] = [];

/** Array of queen rays starting at the indexed square. */
const QUEEN_RAYS: Square[][][] = [];

for (const square of squareGenerator()) {
  // Non-sliding piece handling.
  KING_LOOKUP[square] = kingMoves(square);
  KNIGHT_LOOKUP[square] = knightMoves(square);

  // Sliding piece handling
  const bishopRaysForSquare = bishopRays(square);
  const rookRaysForSquare = rookRays(square);
  RAYS_BY_DIRECTION[square] = {
    ...bishopRaysForSquare,
    ...rookRaysForSquare,
  };
  BISHOP_RAYS[square] = Object.values(bishopRaysForSquare);
  ROOK_RAYS[square] = Object.values(rookRaysForSquare);
  QUEEN_RAYS[square] = Object.values(RAYS_BY_DIRECTION[square]);

  // The "super piece"
  // TODO: should this handle double advance pawn moves?
  SUPER_PIECE_LOOKUP[square] = [
    ...KING_LOOKUP[square],
    ...KNIGHT_LOOKUP[square],
    ...BISHOP_RAYS[square].flat(),
    ...ROOK_RAYS[square].flat(),
  ];
}

export {
  KING_LOOKUP,
  KNIGHT_LOOKUP,
  SUPER_PIECE_LOOKUP,
  BISHOP_RAYS,
  ROOK_RAYS,
  QUEEN_RAYS,
  RAYS_BY_DIRECTION,
};
