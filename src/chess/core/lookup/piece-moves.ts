import {
  ColorData,
  MoveWithExtraData,
  Color,
  PieceType,
  DirectionUnit,
} from '../../types';
import { squareGenerator } from '../../utils';
import { directionOfMove, isBishopDirection } from '../move-utils';
import { pawnAdvanceMoves, pawnCaptureMoves } from './movement';
import {
  BISHOP_RAYS,
  KING_LOOKUP,
  KNIGHT_LOOKUP,
  QUEEN_RAYS,
  ROOK_RAYS,
} from './piece-squares';
import { BishopRays, RookRays } from './rays';

/**
 * Pawn advance pseudo moves by square.
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

/**
 * King pseudo moves by square.
 */
const KING_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

/**
 * Knight pseudo moves by square.
 */
const KNIGHT_MOVES: ColorData<MoveWithExtraData[][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

/**
 * Bishop pseudo move rays by square.
 */
const BISHOP_RAY_MOVES: ColorData<MoveWithExtraData[][][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

/**
 * Rook pseudo move rays by square.
 */
const ROOK_RAY_MOVES: ColorData<MoveWithExtraData[][][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

/**
 * Queen pseudo move rays by square.
 */
const QUEEN_RAY_MOVES: ColorData<MoveWithExtraData[][][]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

type RayMovesByPieceDirection = {
  [PieceType.Bishop]: Record<keyof BishopRays, MoveWithExtraData[]>;
  [PieceType.Rook]: Record<keyof RookRays, MoveWithExtraData[]>;
  [PieceType.Queen]: Record<
    keyof BishopRays | keyof RookRays,
    MoveWithExtraData[]
  >;
};

/**
 * Pesudo move rays for a sliding piece in a direction by square.
 *
 * Move rays are accessed in this manner:
 * `RAY_MOVES_BY_DIRECTION[color][square][pieceType][direction]`
 */
const RAY_MOVES_BY_DIRECTION: ColorData<RayMovesByPieceDirection[]> = {
  [Color.White]: [],
  [Color.Black]: [],
};

// Iterate through all the squares generating actual move objects that can
// be reused.
for (const color of [Color.White, Color.Black]) {
  for (const square of squareGenerator()) {
    PAWN_ADVANCE_MOVES[color][square] = pawnAdvanceMoves(square, color);
    PAWN_CAPTURE_MOVES[color][square] = pawnCaptureMoves(square, color);
    KING_MOVES[color][square] = KING_LOOKUP[square].map((to) => ({
      piece: { color, type: PieceType.King },
      from: square,
      to,
    }));
    KNIGHT_MOVES[color][square] = KNIGHT_LOOKUP[square].map((to) => ({
      piece: { color, type: PieceType.Knight },
      from: square,
      to,
    }));
    BISHOP_RAY_MOVES[color][square] = BISHOP_RAYS[square].map((ray) =>
      ray.map((to) => ({
        piece: { color, type: PieceType.Bishop },
        from: square,
        to,
      })),
    );
    ROOK_RAY_MOVES[color][square] = ROOK_RAYS[square].map((ray) =>
      ray.map((to) => ({
        piece: { color, type: PieceType.Rook },
        from: square,
        to,
      })),
    );
    QUEEN_RAY_MOVES[color][square] = QUEEN_RAYS[square].map((ray) =>
      ray.map((to) => ({
        piece: { color, type: PieceType.Queen },
        from: square,
        to,
      })),
    );

    // Things are getting a bit crazy here yeesh!
    RAY_MOVES_BY_DIRECTION[color][square] = QUEEN_RAYS[
      square
    ].reduce<RayMovesByPieceDirection>(
      (obj, ray) => {
        const direction = directionOfMove(square, ray[0]);

        if (isBishopDirection(direction)) {
          obj[PieceType.Bishop][direction] = ray.map((to) => ({
            piece: { color, type: PieceType.Bishop },
            from: square,
            to,
          }));
        } else {
          obj[PieceType.Rook][direction] = ray.map((to) => ({
            piece: { color, type: PieceType.Rook },
            from: square,
            to,
          }));
        }
        obj[PieceType.Queen][direction] = ray.map((to) => ({
          piece: { color, type: PieceType.Queen },
          from: square,
          to,
        }));
        return obj;
      },
      {
        [PieceType.Bishop]: {
          [DirectionUnit.UpLeft]: [],
          [DirectionUnit.UpRight]: [],
          [DirectionUnit.DownLeft]: [],
          [DirectionUnit.DownRight]: [],
        },
        [PieceType.Rook]: {
          [DirectionUnit.Up]: [],
          [DirectionUnit.Down]: [],
          [DirectionUnit.Left]: [],
          [DirectionUnit.Right]: [],
        },
        [PieceType.Queen]: {
          [DirectionUnit.UpLeft]: [],
          [DirectionUnit.UpRight]: [],
          [DirectionUnit.DownLeft]: [],
          [DirectionUnit.DownRight]: [],
          [DirectionUnit.Up]: [],
          [DirectionUnit.Down]: [],
          [DirectionUnit.Left]: [],
          [DirectionUnit.Right]: [],
        },
      },
    );
  }
}

export {
  PAWN_ADVANCE_MOVES,
  PAWN_CAPTURE_MOVES,
  KING_MOVES,
  KNIGHT_MOVES,
  BISHOP_RAY_MOVES,
  ROOK_RAY_MOVES,
  QUEEN_RAY_MOVES,
  RAY_MOVES_BY_DIRECTION,
};
