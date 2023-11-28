import { isBishopDirection } from './core/move-utils';
import { formatPosition } from './lib/fen';
import {
  Color,
  DirectionUnit,
  Move,
  Piece,
  PieceType,
  Position,
  SlidingPiece,
  Square,
  SquareLabel,
} from './types';

export const WHITE_PAWN_STARTING_RANK = 1;
export const BLACK_PAWN_STARTING_RANK = 6;

export const PROMOTION_OPTION_PIECE_TYPES = [
  PieceType.Bishop,
  PieceType.Knight,
  PieceType.Queen,
  PieceType.Rook,
] as const;

const SQUARE_LABEL_LOOKUP: SquareLabel[] = [
  ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'] as const,
  ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'] as const,
  ['a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6'] as const,
  ['a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5'] as const,
  ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'] as const,
  ['a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3'] as const,
  ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'] as const,
  ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'] as const,
]
  .reverse()
  .flat();

export const rankForSquare = (square: Square) => square % 8; // ????????????????????????

export const rankIndexForSquare = (square: Square) => Math.floor(square / 8);
export const fileIndexForSquare = (square: Square) => square % 8;

export const squareLabel = (square: Square): SquareLabel =>
  SQUARE_LABEL_LOOKUP[square];

export const labelToSquare = (label: SquareLabel): Square =>
  SQUARE_LABEL_LOOKUP.indexOf(label);

export const squareGenerator: () => Generator<Square> = function* () {
  for (let square = 0 as Square; square < 64; square++) {
    yield square;
  }
};

const isSliderPieceType = (
  type: PieceType,
): type is PieceType.Bishop | PieceType.Queen | PieceType.Rook =>
  type === PieceType.Bishop ||
  type === PieceType.Queen ||
  type === PieceType.Rook;

export const isSlider = (piece: Piece): piece is SlidingPiece =>
  isSliderPieceType(piece.type);

export const sliderType = (direction: DirectionUnit) =>
  isBishopDirection(direction) ? PieceType.Bishop : PieceType.Rook;

export const squaresInclude = (
  squares: Readonly<Square[]>,
  square: Square,
): boolean => squares.includes(square);

export const isLegalSquare = (square: Square): boolean =>
  square >= 0 && square < 64;

export const flipColor = (color: Color): Color =>
  color === Color.White ? Color.Black : Color.White;

export const isStartPositionPawn = (color: Color, square: Square): boolean =>
  color === Color.White
    ? square >= 8 * WHITE_PAWN_STARTING_RANK &&
      square < 8 * WHITE_PAWN_STARTING_RANK + 8
    : square >= 8 * BLACK_PAWN_STARTING_RANK &&
      square < 8 * BLACK_PAWN_STARTING_RANK + 8;

export const isPromotionPositionPawn = (
  color: Color,
  square: Square,
): boolean => isStartPositionPawn(flipColor(color), square);

export const findKing = (
  position: Position,
  color: Color,
): Square | undefined => {
  for (const [square, piece] of position.pieces) {
    if (piece.type === PieceType.King && piece.color === color) {
      return square;
    }
  }

  return;
};

export const copyPosition = (position: Position): Position => {
  const pieces = new Map(position.pieces);

  return {
    pieces,
    turn: position.turn,
    castlingState: position.castlingState,
    enPassantSquare: position.enPassantSquare,
    halfMoveCount: position.halfMoveCount,
    fullMoveCount: position.fullMoveCount,
  };
};

export const isPositionEqual = (a: Position, b: Position): boolean => {
  const fenA = formatPosition(a);
  const fenB = formatPosition(b);

  return fenA === fenB;
};
