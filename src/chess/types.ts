/**
 * A square on the chess board.
 *
 * Note: fits in 6 bits.
 */
export type Square = Readonly<number>;

/**
 * A rank on the chess board.
 */
export const enum SquareRank {
  _1,
  _2,
  _3,
  _4,
  _5,
  _6,
  _7,
  _8,
}

/**
 * A file on the chess board.
 */
export const enum SquareFile {
  _A,
  _B,
  _C,
  _D,
  _E,
  _F,
  _G,
  _H,
}

/**
 * Color of a square or piece.
 */
export const enum Color {
  White = 0,
  Black = 1,
}

/**
 * Type of piece.
 *
 * Indexed at 1 for convenience. Either way a piece type will fit in 3 bits.
 */
export const enum PieceType {
  Pawn = 1,
  Knight = 2,
  Bishop = 3,
  Rook = 4,
  Queen = 5,
  King = 6,
}

/**
 * Types of pieces a pawn can promote to.
 */
export type PromotionOption =
  | PieceType.Bishop
  | PieceType.Knight
  | PieceType.Queen
  | PieceType.Rook;

export type Piece = Readonly<{
  type: PieceType;
  color: Color;
}>;

export type SlidingPiece =
  | { color: Color; type: PieceType.Bishop }
  | { color: Color; type: PieceType.Rook }
  | { color: Color; type: PieceType.Queen };

/**
 * Castling state of the position represented as 4 bits.
 */
export enum CastlingState {
  None = 0b0000,

  White_OO = 0b0001,
  White_OOO = 0b0010,
  Black_OO = 0b0100,
  Black_OOO = 0b1000,

  White = White_OO | White_OOO,
  Black = Black_OO | Black_OOO,
  Kingside = White_OO | Black_OO,
  Queenside = White_OOO | Black_OOO,

  White_OO__Black_OOO = White_OO | Black_OOO,
  White_OO__Black = White_OO | Black,
  White_OOO__Black_OO = White_OOO | Black_OO,
  White_OOO__Black = White_OOO | Black,
  White__Black_OO = White | Black_OO,
  White__Black_OOO = White | Black_OOO,

  All = White | Black,
}

/**
 * Directions you can move on a board (or 2-dimensional grid).
 *
 * This enum is preferred when building objects key'd by directions to allow
 * an array lookup instead of object lookup.
 */
export const enum Direction {
  Up,
  Right,
  Down,
  Left,
  UpLeft,
  UpRight,
  DownLeft,
  DownRight,
}

export type BishopDirection =
  | DirectionUnit.UpLeft
  | DirectionUnit.UpRight
  | DirectionUnit.DownLeft
  | DirectionUnit.DownRight;

export type RookDirection =
  | DirectionUnit.Up
  | DirectionUnit.Down
  | DirectionUnit.Left
  | DirectionUnit.Right;

/**
 * Directions you can move on a board (or 2-dimensional grid). Enum values are
 * set to integer values which actually reflect moving on the 8x8 board we
 * construct.
 */
export const enum DirectionUnit {
  Up = 8,
  Right = 1,
  Down = -8,
  Left = -1,
  UpLeft = 7,
  UpRight = 9,
  DownLeft = -9,
  DownRight = -7,
}

/**
 * Simplest representation of a move that can be applied by the chess core.
 */
export type Move = {
  from: Square;
  to: Square;
  promotion?: PromotionOption;
};

/**
 * Describes control a piece has on a square. Fully represents a move that can
 * be executed or evaluated, although the move may not be legal.
 *
 * Note that a piece must be able to capture or defend a square to have
 * control of it therefore pawn advancement and castling moves do not control
 * squares.
 */
export type SquareControl = {
  /** The controlling piece. */
  readonly piece: Piece;
  /** The square of the controlling piece. */
  readonly from: Square;
  /** The square under control. */
  readonly to: Square;

  /**
   * Whether this square control is an attack on another piece. To find the type
   * of piece use the current pieces map.
   *
   * Note: this state may hang around on moves between positions. The boolean
   * is always re-set when generating a list of moves.
   */
  attack?: boolean;
  /**
   * Weight of the move scored by the move ordering function.
   *
   * Note: This state may hang around on moves between positions. The move
   * ordering function will always re-score moves before sorting.
   */
  weight?: number;
};

export type MoveWithExtraData = Move & SquareControl;

/**
 * Describes a pin in a position.
 */
export type Pin = Readonly<{
  /** The square of the attacker creating the pin. */
  from: Square;
  /** The square with the pinned or skewered piece. */
  to: Square;
  /** Stored computed direction from->to */
  direction: DirectionUnit;
  /**
   * Legal squares the pinned piece can move to while maintaining the pin.
   * This includes it's resident square.
   */
  legalMoveSquares: Readonly<Square[]>;
}>;

/**
 * Fully represent a unique chess position.
 */
export type Position = {
  /** Map of board squares to pieces tracking where pieces are located. */
  readonly pieces: Map<Square, Piece>;
  /** Which player's turn it is. */
  turn: Color;
  /** Castling state  */
  castlingState: CastlingState;
  /**
   * If a pawn has just made a two-square move, this is the
   * square "behind" the pawn.
   */
  enPassantSquare: Square | null;
  /**
   * The number of halfmoves since the last capture or pawn advance, used for
   * the fifty-move rule.
   */
  halfMoveCount: number;
  /**
   * The number of the full move. It starts at 1, and is incremented
   * after Black's move.
   */
  fullMoveCount: number;
};

export type ColorData<T> = Readonly<{
  [Color.White]: T;
  [Color.Black]: T;
}>;

export type SquareLabel =
  | 'a1'
  | 'a2'
  | 'a3'
  | 'a4'
  | 'a5'
  | 'a6'
  | 'a7'
  | 'a8'
  | 'b1'
  | 'b2'
  | 'b3'
  | 'b4'
  | 'b5'
  | 'b6'
  | 'b7'
  | 'b8'
  | 'c1'
  | 'c2'
  | 'c3'
  | 'c4'
  | 'c5'
  | 'c6'
  | 'c7'
  | 'c8'
  | 'd1'
  | 'd2'
  | 'd3'
  | 'd4'
  | 'd5'
  | 'd6'
  | 'd7'
  | 'd8'
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'g1'
  | 'g2'
  | 'g3'
  | 'g4'
  | 'g5'
  | 'g6'
  | 'g7'
  | 'g8'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'h7'
  | 'h8';
