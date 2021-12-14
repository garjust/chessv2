import { Color, Move, Position, Square } from './types';

const fileIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

export const squareLabel = ({ rank, file }: Square): string =>
  `${fileIndexToChar(file)}${rank + 1}`;

export const labelToSquare = (label: string): Square => ({
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

export const applyMove = (position: Position, move: Move): Position => {
  const piece = position.pieces.get(move.from);

  if (!piece) {
    throw Error('no piece to move');
  }
  if (piece.color !== position.turn) {
    throw Error('cannot move piece for other color');
  }

  position.pieces.delete(move.from);
  position.pieces.set(move.to, piece);
  position.turn = position.turn === Color.White ? Color.Black : Color.White;

  return position;
};
