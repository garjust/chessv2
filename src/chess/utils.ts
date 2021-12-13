import { Color, FEN, Piece, PieceAndSquare, Square, SquareDef } from './types';

export const STARTING_POSITION_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const fileIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

export const squareLabel = ({ rank, file }: SquareDef): string =>
  `${fileIndexToChar(file)}${rank + 1}`;

export const squareLabelToDef = (label: string): SquareDef => ({
  rank: label.charCodeAt(0) - 97,
  file: Number(label[1]) - 1,
});

export const squareGenerator = function* () {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      yield { rank, file };
    }
  }
};

export const squareInBoard = (
  board: Square[][],
  squareDef: SquareDef
): Square => board[squareDef.rank][squareDef.file];

export const buildBoard = (): Square[][] => {
  const board = new Array<Square[]>(8);
  for (let i = 0; i < 8; i++) {
    board[i] = new Array<Square>(8);
  }

  for (const { rank, file } of squareGenerator()) {
    board[rank][file] = {
      rank,
      file,
      piece: null,
    };
  }

  return board;
};

export const setPosition = (board: Square[][], pieces: PieceAndSquare[]) =>
  pieces.forEach(({ piece, squareDef }) => {
    board[squareDef.rank][squareDef.file].piece = {
      color: piece.color,
      type: piece.type,
    };
  });

export const piecesFromFEN = (fenString: string): PieceAndSquare[] => {
  return [];
};

export const setPositionFromFEN = (board: Square[][], fenString: string) => {
  setPosition(board, piecesFromFEN(fenString));
};

const piecesFromFENPiecePlacements = (
  piecePlacements: string
): PieceAndSquare[] => {
  const pieces: PieceAndSquare[] = [];

  return pieces;
};

export const parseFEN = (fenString: string): FEN => {
  const [
    piecePlacements,
    activeColor,
    castlingAvailability,
    enPassantSquare,
    halfMoveClock,
    fullMoveNumber,
  ] = fenString.split(' ');

  return {
    pieces: piecesFromFENPiecePlacements(piecePlacements),
    turn: activeColor === 'w' ? Color.White : Color.Black,
    castlingAvailability: {
      whiteKingside: castlingAvailability.includes('K'),
      whiteQueenside: castlingAvailability.includes('Q'),
      blackKingside: castlingAvailability.includes('k'),
      blackQueenside: castlingAvailability.includes('q'),
    },
    enPassantSquare:
      enPassantSquare !== '-' ? squareLabelToDef(enPassantSquare) : null,
    halfMoveCount: Number(halfMoveClock),
    fullMoveCount: Number(fullMoveNumber),
  };
};
