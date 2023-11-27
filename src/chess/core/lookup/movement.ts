import {
  Color,
  DirectionUnit,
  MoveWithExtraData,
  PieceType,
  Square,
} from '../../types';
import {
  fileIndexForSquare,
  isPromotionPositionPawn,
  isStartPositionPawn,
  rankIndexForSquare,
} from '../../utils';
import { expandPromotions } from '../move-utils';

/**
 * Define a less error prone square representation for pre-computing lookup
 * data. This representation is slower (object vs primitive) but enables easy
 * protection against illegal moves wrapping the board.
 */
type RankFileSquare = { rank: number; file: number };

export const rankFileToSquare = ({ rank, file }: RankFileSquare): Square =>
  (rank * 8 + file) as Square;

export const rankFileSquare = (square: Square): RankFileSquare => ({
  rank: rankIndexForSquare(square),
  file: fileIndexForSquare(square),
});

export const isLegalSquare = (square: RankFileSquare): boolean =>
  square.rank >= 0 && square.rank < 8 && square.file >= 0 && square.file < 8;

export const up = ({ rank, file }: RankFileSquare, n = 1): RankFileSquare => ({
  rank: rank + n,
  file: file,
});
export const down = (
  { rank, file }: RankFileSquare,
  n = 1,
): RankFileSquare => ({
  rank: rank - n,
  file: file,
});
export const left = (
  { rank, file }: RankFileSquare,
  n = 1,
): RankFileSquare => ({
  rank: rank,
  file: file - n,
});
export const right = (
  { rank, file }: RankFileSquare,
  n = 1,
): RankFileSquare => ({
  rank: rank,
  file: file + n,
});
export const upLeft = (square: RankFileSquare, n = 1): RankFileSquare =>
  up(left(square, n), n);
export const upRight = (square: RankFileSquare, n = 1): RankFileSquare =>
  up(right(square, n), n);
export const downLeft = (square: RankFileSquare, n = 1): RankFileSquare =>
  down(left(square, n), n);
export const downRight = (square: RankFileSquare, n = 1): RankFileSquare =>
  down(right(square, n), n);

export const pawnAdvanceMoves = (
  from: Square,
  color: Color,
): MoveWithExtraData[] => {
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

export const pawnCaptureMoves = (
  from: Square,
  color: Color,
): MoveWithExtraData[] => {
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

export const kingMoves = (from: Square): Square[] =>
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

export const knightMoves = (from: Square): Square[] =>
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
