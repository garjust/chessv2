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

const SQUARE_LABEL_LOOKUP: SquareLabel[][] = [
  ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'],
  ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
  ['a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3'],
  ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'],
  ['a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5'],
  ['a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6'],
  ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
  ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'],
];

type Nullable<T> = T | undefined | null;

export const squareLabel = ({ rank, file }: Square): SquareLabel =>
  SQUARE_LABEL_LOOKUP[rank][file];

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

export const moveToDirectionString = (move: Move): string =>
  `${squareLabel(move.from)}->${squareLabel(move.to)}`;

export const isStartPositionPawn = (color: Color, square: Square): boolean =>
  color === Color.White
    ? square.rank === WHITE_PAWN_STARTING_RANK
    : square.rank === BLACK_PAWN_STARTING_RANK;

export const isPromotionPositionPawn = (
  color: Color,
  square: Square
): boolean =>
  color === Color.White
    ? square.rank === BLACK_PAWN_STARTING_RANK
    : square.rank === WHITE_PAWN_STARTING_RANK;
