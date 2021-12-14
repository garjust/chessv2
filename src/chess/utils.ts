import { Move, Position, Square } from './types';

export const fileIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

export const squareLabel = ({ rank, file }: Square): string =>
  `${fileIndexToChar(file)}${rank + 1}`;

export const squareLabelToDef = (label: string): Square => ({
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

// export const buildBoard = (): Square[][] => {
//   const board = new Array<Square[]>(8);
//   for (let i = 0; i < 8; i++) {
//     board[i] = new Array<Square>(8);
//   }

//   for (const { rank, file } of squareGenerator()) {
//     board[rank][file] = {
//       rank,
//       file,
//     };
//   }

//   return board;
// };

export const applyMove = (position: Position, move: Move): Position => {
  const piece = position.pieces.get(move.from);
  if (piece) {
    position.pieces.delete(move.from);
    position.pieces.set(move.to, piece);
  } else {
    throw Error('no piece to move');
  }

  return position;
};
