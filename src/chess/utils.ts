import { PieceAndSquare, Square, SquareDef } from './types';

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

export const findPiecesInboard = (board: Square[][]): PieceAndSquare[] =>
  board
    .flat()
    .map((square) => ({
      piece: square.piece,
      squareDef: { rank: square.rank, file: square.file },
    }))
    .filter(
      (pieceAndSquare): pieceAndSquare is PieceAndSquare =>
        pieceAndSquare.piece !== null
    );
