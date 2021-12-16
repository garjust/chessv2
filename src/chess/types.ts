import StringKeyMap from '../lib/string-key-map';

export enum Color {
  White = 'WHITE',
  Black = 'BLACK',
}

export enum PieceType {
  Bishop = 'BISHOP',
  King = 'KING',
  Knight = 'KNIGHT',
  Pawn = 'PAWN',
  Queen = 'QUEEN',
  Rook = 'ROOK',
}

export type Piece = {
  type: PieceType;
  color: Color;
};

export type Square = {
  rank: number;
  file: number;
};

export type Move = {
  from: Square;
  to: Square;
};

export type MoveDetail = {
  to: Square;
  capture: boolean;
  kingCapture: boolean;
};

export type Moveset = {
  piece: Piece;
  square: Square;
  moves: MoveDetail[];
};

export type CastlingAvailability = {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
};

export type Position = {
  pieces: StringKeyMap<Square, Piece>;
  // Which player's turn it is.
  turn: Color;
  // Castling availability.
  castlingAvailability: CastlingAvailability;
  // If a pawn has just made a two-square move, this is the
  // position "behind" the pawn.
  enPassantSquare: Square | null;
  // The number of halfmoves since the last capture or pawn advance, used for
  // the fifty-move rule.
  halfMoveCount: number;
  // The number of the full move. It starts at 1, and is incremented
  // after Black's move.
  fullMoveCount: number;
};

export type MovesByPiece = Map<PieceType, StringKeyMap<Square, MoveDetail[]>>;

// Data that can be computed from a position that we may want to cache because
// computation is expensive.
export type ComputedPositionData = {
  movesByPiece: MovesByPiece;
  totalMoves: number;
  availableCaptures: Move[];
  availableChecks: Move[];
  checksOnSelf: Move[];
  checkmate: boolean;
  evaluation: number;
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
