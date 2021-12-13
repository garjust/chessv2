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

export type SquareDef = {
  rank: number;
  file: number;
};

export type PieceAndSquare = {
  piece: Piece;
  squareDef: SquareDef;
};

export type Square = {
  rank: number;
  file: number;
  piece: Piece | null;
};

export type CastlingAvailability = {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
};

export type FEN = {
  pieces: PieceAndSquare[];
  // Which player's turn it is.
  turn: Color;
  // Castling availability.
  castlingAvailability: CastlingAvailability;
  // If a pawn has just made a two-square move, this is the
  // position "behind" the pawn.
  enPassantSquare: SquareDef | null;
  // The number of halfmoves since the last capture or pawn advance, used for
  // the fifty-move rule.
  halfMoveCount: number;
  // The number of the full move. It starts at 1, and is incremented
  // after Black's move.
  fullMoveCount: number;
};
