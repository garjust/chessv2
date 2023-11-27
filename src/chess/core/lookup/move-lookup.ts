import {
  Color,
  ColorData,
  DirectionUnit,
  MoveWithExtraData,
  PieceType,
  Square,
} from '../../types';
import {
  isPromotionPositionPawn,
  isStartPositionPawn,
  squareGenerator,
} from '../../utils';
import { expandPromotions } from '../move-utils';
import {
  isLegalSquare,
  down,
  downLeft,
  downRight,
  left,
  right,
  rankFileSquare,
  up,
  upLeft,
  upRight,
  rankFileToSquare,
} from './movement';
import { ray } from './rays';

const pawnAdvanceMoves = (from: Square, color: Color): MoveWithExtraData[] => {
  const moves: MoveWithExtraData[] = [];

  const advanceFn = color === Color.White ? up : down;
  const advance = advanceFn(rankFileSquare(from));

  if (isLegalSquare(advance)) {
    moves.push({
      piece: { color, type: PieceType.Pawn },
      from,
      to: rankFileToSquare(advance),
      attack: false,
    });
  }
  if (isStartPositionPawn(color, from)) {
    moves.push({
      piece: { color, type: PieceType.Pawn },
      from,
      to: rankFileToSquare(advanceFn(advance)),
      attack: false,
    });
  }
  if (isPromotionPositionPawn(color, from)) {
    return moves.flatMap(expandPromotions);
  }

  return moves;
};

const pawnCaptureMoves = (from: Square, color: Color): MoveWithExtraData[] => {
  const moves: MoveWithExtraData[] = [];

  const advanceFn = color === Color.White ? up : down;
  const leftCaptureSquare = advanceFn(left(rankFileSquare(from)));
  const rightCaptureSquare = advanceFn(right(rankFileSquare(from)));

  if (isLegalSquare(leftCaptureSquare)) {
    moves.push({
      piece: { color, type: PieceType.Pawn },
      from,
      to: rankFileToSquare(leftCaptureSquare),
    });
  }
  if (isLegalSquare(rightCaptureSquare)) {
    moves.push({
      piece: { color, type: PieceType.Pawn },
      from,
      to: rankFileToSquare(rightCaptureSquare),
    });
  }

  return moves;
};

const kingMoves = (from: Square): Square[] =>
  [
    up(rankFileSquare(from)),
    left(rankFileSquare(from)),
    right(rankFileSquare(from)),
    down(rankFileSquare(from)),
    upLeft(rankFileSquare(from)),
    upRight(rankFileSquare(from)),
    downLeft(rankFileSquare(from)),
    downRight(rankFileSquare(from)),
  ]
    .filter((square) => isLegalSquare(square))
    .map(rankFileToSquare);

const knightMoves = (from: Square): Square[] =>
  [
    up(left(rankFileSquare(from)), 2),
    up(right(rankFileSquare(from)), 2),
    left(up(rankFileSquare(from)), 2),
    left(down(rankFileSquare(from)), 2),
    down(left(rankFileSquare(from)), 2),
    down(right(rankFileSquare(from)), 2),
    right(up(rankFileSquare(from)), 2),
    right(down(rankFileSquare(from)), 2),
  ]
    .filter((square) => isLegalSquare(square))
    .map(rankFileToSquare);

// const bishopMoves = (from: Square): Square[][] =>
//   [upLeft, upRight, downLeft, downRight].map(scan(from));

// const rookMoves = (from: Square): Square[][] =>
//   [up, right, left, down].map(scan(from));

type BishopRays = {
  [DirectionUnit.UpLeft]: Square[];
  [DirectionUnit.UpRight]: Square[];
  [DirectionUnit.DownLeft]: Square[];
  [DirectionUnit.DownRight]: Square[];
};

type RookRays = {
  [DirectionUnit.Up]: Square[];
  [DirectionUnit.Down]: Square[];
  [DirectionUnit.Left]: Square[];
  [DirectionUnit.Right]: Square[];
};

const bishopMovesByDirection = (from: Square): BishopRays =>
  (
    [
      DirectionUnit.UpLeft,
      DirectionUnit.UpRight,
      DirectionUnit.DownLeft,
      DirectionUnit.DownRight,
    ] as const
  ).reduce<BishopRays>(
    (obj, direction) => {
      obj[direction] = ray(from, direction);
      return obj;
    },
    {
      [DirectionUnit.UpLeft]: [],
      [DirectionUnit.UpRight]: [],
      [DirectionUnit.DownLeft]: [],
      [DirectionUnit.DownRight]: [],
    },
  );

const rookMovesByDirection = (from: Square): RookRays =>
  (
    [
      DirectionUnit.Up,
      DirectionUnit.Right,
      DirectionUnit.Left,
      DirectionUnit.Down,
    ] as const
  ).reduce<RookRays>(
    (obj, direction) => {
      obj[direction] = ray(from, direction);
      return obj;
    },
    {
      [DirectionUnit.Up]: [],
      [DirectionUnit.Down]: [],
      [DirectionUnit.Left]: [],
      [DirectionUnit.Right]: [],
    },
  );

const KING_LOOKUP: Square[][] = [];
const KNIGHT_LOOKUP: Square[][] = [];
const BISHOP_LOOKUP: Square[][][] = [];
const ROOK_LOOKUP: Square[][][] = [];
const QUEEN_LOOKUP: Square[][][] = [];

const BISHOP_LOOKUP_BY_DIRECTION: Array<BishopRays> = [];
const ROOK_LOOKUP_BY_DIRECTION: Array<RookRays> = [];
const RAYS_BY_DIRECTION: Array<BishopRays & RookRays> = [];

const SUPER_PIECE_LOOKUP: Square[][] = [];

for (const square of squareGenerator()) {
  BISHOP_LOOKUP_BY_DIRECTION[square] = bishopMovesByDirection(square);
  ROOK_LOOKUP_BY_DIRECTION[square] = rookMovesByDirection(square);
  RAYS_BY_DIRECTION[square] = {
    ...bishopMovesByDirection(square),
    ...rookMovesByDirection(square),
  };

  KING_LOOKUP[square] = kingMoves(square);
  KNIGHT_LOOKUP[square] = knightMoves(square);
  BISHOP_LOOKUP[square] = Object.values(BISHOP_LOOKUP_BY_DIRECTION[square]);
  ROOK_LOOKUP[square] = Object.values(ROOK_LOOKUP_BY_DIRECTION[square]);
  QUEEN_LOOKUP[square] = Object.values(RAYS_BY_DIRECTION[square]);

  SUPER_PIECE_LOOKUP[square] = [
    ...BISHOP_LOOKUP[square].flat(),
    ...ROOK_LOOKUP[square].flat(),
    ...KNIGHT_LOOKUP[square],
    ...KING_LOOKUP[square],
  ];
}

/**
 * Pawn advance pseudo moves by from square.
 *
 * Move arrays can be 3 different lengths:
 * - 1: normal advance in the middle of the board
 * - 2: the pawn is in the starting position and has two advance moves
 * - 4: the pawn can promote when it advances and each move is a different
 *      promotion.
 */
const PAWN_ADVANCE_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

/**
 * Pawn capture pseudo moves by square.
 */
const PAWN_CAPTURE_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

const KNIGHT_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

const KING_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

// Iterate through all the squares again this time generating actual move
// objects that can be reused.
for (const square of squareGenerator()) {
  KING_MOVES[Color.White][square] = KING_LOOKUP[square].map((to) => ({
    piece: { color: Color.White, type: PieceType.King },
    from: square,
    to,
  }));
  KING_MOVES[Color.Black][square] = KING_LOOKUP[square].map((to) => ({
    piece: { color: Color.Black, type: PieceType.King },
    from: square,
    to,
  }));
  KNIGHT_MOVES[Color.White][square] = KNIGHT_LOOKUP[square].map((to) => ({
    piece: { color: Color.White, type: PieceType.Knight },
    from: square,
    to,
  }));
  KNIGHT_MOVES[Color.Black][square] = KNIGHT_LOOKUP[square].map((to) => ({
    piece: { color: Color.Black, type: PieceType.Knight },
    from: square,
    to,
  }));
  PAWN_ADVANCE_MOVES[Color.White][square] = pawnAdvanceMoves(
    square,
    Color.White,
  );
  PAWN_ADVANCE_MOVES[Color.Black][square] = pawnAdvanceMoves(
    square,
    Color.Black,
  );
  PAWN_CAPTURE_MOVES[Color.White][square] = pawnCaptureMoves(
    square,
    Color.White,
  );
  PAWN_CAPTURE_MOVES[Color.Black][square] = pawnCaptureMoves(
    square,
    Color.Black,
  );
}

// Move lookup bitarrays
// -----------------------------------------------------------------------------

export {
  BISHOP_LOOKUP,
  KING_MOVES,
  QUEEN_LOOKUP,
  SUPER_PIECE_LOOKUP,
  KNIGHT_MOVES,
  ROOK_LOOKUP,
  PAWN_ADVANCE_MOVES,
  PAWN_CAPTURE_MOVES,
  RAYS_BY_DIRECTION,
};
