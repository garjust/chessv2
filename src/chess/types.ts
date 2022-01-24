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

// export type Piece = bigint;
export type Piece = {
  type: PieceType;
  color: Color;
};

export type SlidingPiece =
  | { color: Color; type: PieceType.Bishop }
  | { color: Color; type: PieceType.Rook }
  | { color: Color; type: PieceType.Queen };

export type Square = number;

export type RankFile = {
  rank: number;
  file: number;
};

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

export type Pin = {
  // The square with the pinned or skewered piece.
  pinned: Square;
  // The square of the attacker creating the pin.
  attacker: Square;
  // Legal squares the pinned piece can move to. This includes it's
  // resident square.
  legalMoveSquares: Square[];
};

export type AttackObject = {
  // The square being attacked for this object
  attacked: { square: Square; type: PieceType };
  // The attacking piece
  attacker: { square: Square; type: PieceType };
  // If the attacker is a sliding piece this is the set of squares they move through
  // for the attack. A move to one of these squares blocks the attack.
  slideSquares: Square[];
};

export type SquareControlObject = {
  square: Square;
  // The attacking piece
  attacker: { square: Square; type: PieceType };
  // If the attacker is a sliding piece this is the set of squares they move through
  // for the attack. A move to one of these squares blocks the attack.
  slideSquares: Square[];
};

export type MoveWithExtraData = Move & {
  piece: Piece;
  attack?: AttackObject;
  weight?: number;
};

export type CastlingSide = 'kingside' | 'queenside';

export type CastlingAvailability = {
  [Color.White]: {
    kingside: boolean;
    queenside: boolean;
  };
  [Color.Black]: {
    kingside: boolean;
    queenside: boolean;
  };
};

export type Position = {
  pieces: Map<Square, Piece>;
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
