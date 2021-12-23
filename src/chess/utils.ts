import { Color, Move, MovesByPiece, Square, SquareLabel } from './types';

export const WHITE_PAWN_STARTING_RANK = 1;
export const BLACK_PAWN_STARTING_RANK = 6;

export const ROOK_STARTING_SQUARES = Object.freeze({
  [Color.White]: {
    queenside: { rank: 0, file: 0 },
    kingside: { rank: 0, file: 7 },
  },
  [Color.Black]: {
    queenside: { rank: 7, file: 0 },
    kingside: { rank: 7, file: 7 },
  },
});

type Nullable<T> = T | undefined | null;

const fileIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

export const squareLabel = ({ rank, file }: Square): SquareLabel =>
  `${fileIndexToChar(file)}${rank + 1}` as SquareLabel;

export const labelToSquare = ([file, rank]: string): Square => ({
  file: file.charCodeAt(0) - 97,
  rank: Number(rank) - 1,
});

export const squareGenerator = function* () {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      yield { rank, file };
    }
  }
};

export const squareEquals = (
  a: Nullable<Square>,
  b: Nullable<Square>
): boolean => Boolean(a && b && a.file === b.file && a.rank === b.rank);

export const squaresInclude = (squares: Square[], square: Square): boolean =>
  squares.some((x) => squareEquals(x, square));

export const moveEquals = (a: Nullable<Move>, b: Nullable<Move>): boolean =>
  Boolean(a && b && squareEquals(a.from, b.from) && squareEquals(a.to, b.to));

export const movesIncludes = (moves: Move[], move: Move): boolean =>
  moves.some((x) => moveEquals(x, move));

export const isLegalSquare = ({ rank, file }: Square): boolean =>
  rank >= 0 && rank < 8 && file >= 0 && file < 8;

export const flipColor = (color: Color): Color =>
  color === Color.White ? Color.Black : Color.White;

export const flattenMoves = (movesByPiece: MovesByPiece): Move[] => {
  const moves: Move[] = [];

  for (const map of movesByPiece.values()) {
    for (const [from, squares] of map.entries()) {
      for (const { to } of squares) {
        moves.push({ from, to });
      }
    }
  }

  return moves;
};
