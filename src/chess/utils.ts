import { SquareMap } from './square-map';
import {
  Color,
  Move,
  Piece,
  PieceType,
  Position,
  RankFile,
  Square,
  SquareLabel,
} from './types';

export const WHITE_PAWN_STARTING_RANK = 1;
export const BLACK_PAWN_STARTING_RANK = 6;

export const ROOK_STARTING_SQUARES = Object.freeze({
  [Color.White]: {
    queenside: 0,
    kingside: 7,
  },
  [Color.Black]: {
    queenside: 56,
    kingside: 63,
  },
});

/* eslint-disable prettier/prettier */
const SQUARE_LABEL_LOOKUP: SquareLabel[] = [
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
];
/* eslint-enable prettier/prettier */

type Nullable<T> = T | undefined | null;

export const rankFileToSquare = ({ rank, file }: RankFile): Square =>
  rank * 8 + file;

export const squareLabel = (square: Square): SquareLabel =>
  SQUARE_LABEL_LOOKUP[square];

export const labelToSquare = (label: SquareLabel): Square =>
  SQUARE_LABEL_LOOKUP.indexOf(label);

export const squareGenerator = function* () {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      yield { rank, file };
    }
  }
};

export const isSlider = (type?: PieceType): boolean =>
  type === PieceType.Bishop ||
  type === PieceType.Queen ||
  type === PieceType.Rook;

export const squaresInclude = (squares: Square[], square: Square): boolean =>
  squares.includes(square);

export const moveEquals = (a: Nullable<Move>, b: Nullable<Move>): boolean =>
  Boolean(a && b && a.from === b.from && a.to === b.to);

export const movesIncludes = (moves: Move[], move: Move): boolean =>
  moves.some((x) => moveEquals(x, move));

export const isLegalSquare = (square: Square): boolean =>
  square >= 0 && square < 64;

export const flipColor = (color: Color): Color =>
  color === Color.White ? Color.Black : Color.White;

export const moveToDirectionString = (move: Move): string =>
  move.promotion
    ? `${squareLabel(move.from)}->${squareLabel(move.to)}(${move.promotion})`
    : `${squareLabel(move.from)}->${squareLabel(move.to)}`;

export const isStartPositionPawn = (color: Color, square: Square): boolean =>
  color === Color.White
    ? square >= 8 * WHITE_PAWN_STARTING_RANK &&
      square < 8 * WHITE_PAWN_STARTING_RANK + 8
    : square >= 8 * BLACK_PAWN_STARTING_RANK &&
      square < 8 * BLACK_PAWN_STARTING_RANK + 8;

export const isPromotionPositionPawn = (
  color: Color,
  square: Square
): boolean => isStartPositionPawn(flipColor(color), square);

export const findKing = (
  position: Position,
  color: Color
): Square | undefined => {
  for (const [square, piece] of position.pieces) {
    // Find the king we want to compute attacks for.
    if (piece.type === PieceType.King && piece.color === color) {
      return square;
    }
  }

  return;
};

export const copyPosition = (position: Position): Position => {
  const pieces = new SquareMap<Piece>();
  for (const [key, value] of position.pieces) {
    pieces.set(key, value);
  }

  const castlingAvailability = {
    [Color.White]: {
      kingside: position.castlingAvailability[Color.White].kingside,
      queenside: position.castlingAvailability[Color.White].queenside,
    },
    [Color.Black]: {
      kingside: position.castlingAvailability[Color.Black].kingside,
      queenside: position.castlingAvailability[Color.Black].queenside,
    },
  };

  return {
    pieces,
    turn: position.turn,
    castlingAvailability,
    enPassantSquare: position.enPassantSquare,
    halfMoveCount: position.halfMoveCount,
    fullMoveCount: position.fullMoveCount,
  };
};
