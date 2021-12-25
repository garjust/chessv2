import { Position, PieceType, Color } from '../../types';

const PieceValue: Record<PieceType, number> = Object.freeze({
  [PieceType.Bishop]: 3,
  [PieceType.King]: Infinity,
  [PieceType.Knight]: 3,
  [PieceType.Pawn]: 1,
  [PieceType.Queen]: 9,
  [PieceType.Rook]: 5,
});

const modifier = (color: Color) => (color === Color.White ? 1 : -1);

export const evaluate = (position: Position): number => {
  let evaluation = 0;

  let whiteKing = false;
  let blackKing = false;

  for (const [, piece] of position.pieces) {
    if (piece.type === PieceType.King) {
      if (piece.color === Color.White) {
        whiteKing = true;
      }
      if (piece.color === Color.Black) {
        blackKing = true;
      }
      continue;
    }
    evaluation += PieceValue[piece.type] * modifier(piece.color);
  }

  if (!whiteKing) {
    return -Infinity;
  } else if (!blackKing) {
    return Infinity;
  }

  return evaluation;
};
