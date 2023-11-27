/**
 * A square on the chess board.
 *
 * Npte: fits in 6 bits.
 */
export type Square = Readonly<number>;

/**
 * Color of a square or piece.
 */
export enum Color {
  White = 0,
  Black = 1,
}

/**
 * Type of piece.
 *
 * Indexed at 1 for convenience. Either way a piece type will fit in 3 bits.
 */
export enum PieceType {
  Pawn = 1,
  Knight = 2,
  Bishop = 3,
  Rook = 4,
  Queen = 5,
  King = 6,
}

export type Piece = Readonly<{
  type: PieceType;
  color: Color;
}>;

export type SlidingPiece =
  | { color: Color; type: PieceType.Bishop }
  | { color: Color; type: PieceType.Rook }
  | { color: Color; type: PieceType.Queen };

/**
 * Each value corresponds to moving from one square to an adjacent square in
 * the defined direction.
 */
export enum DirectionUnit {
  Up = 8,
  Right = 1,
  Down = -8,
  Left = -1,
  UpLeft = 7,
  UpRight = 9,
  DownLeft = -9,
  DownRight = -7,
}

export type PromotionOption =
  | PieceType.Bishop
  | PieceType.Knight
  | PieceType.Queen
  | PieceType.Rook;

export type Move = {
  from: Square;
  to: Square;
  promotion?: PromotionOption;
};

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
 * Describes control a piece has on a square. Fully represents a move that can
 * be executed or evaluated, although the move may not be legal.
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

export type MoveWithExtraData = Move & {
  piece: Piece;
  attack?: boolean;
  weight?: number;
};

export type CastlingSide = 'kingside' | 'queenside';

export type CastlingData<T> = Readonly<{
  [Color.White]: {
    kingside: T;
    queenside: T;
  };
  [Color.Black]: {
    kingside: T;
    queenside: T;
  };
}>;

export type CastlingAvailability = CastlingData<boolean>;

/**
 * Fully represent a unique chess position.
 */
export type Position = {
  /** Map of board squares to pieces tracking where pieces are located. */
  readonly pieces: Map<Square, Piece>;
  /** Which player's turn it is. */
  turn: Color;
  /** Castling availability map. */
  castlingAvailability: CastlingAvailability;
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
