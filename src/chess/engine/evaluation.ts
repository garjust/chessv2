import { Position, PieceType, Color, Piece, Square } from '../types';
import { HEATMAPS } from '../lib/heatmaps';

export const PieceValue: Record<PieceType, number> = Object.freeze({
  [PieceType.Bishop]: 3,
  [PieceType.King]: Infinity,
  [PieceType.Knight]: 3,
  [PieceType.Pawn]: 1,
  [PieceType.Queen]: 9,
  [PieceType.Rook]: 5,
});

const modifier = (color: Color) => (color === Color.White ? 1 : -1);

const squareValue = (square: Square, piece: Piece): number =>
  HEATMAPS[piece.type][piece.color][square] / 10;

export const evaluate = (position: Position): number => {
  let evaluation = 0;

  for (const [square, piece] of position.pieces) {
    if (piece.type === PieceType.King) {
      continue;
    }
    evaluation +=
      (PieceValue[piece.type] + squareValue(square, piece)) *
      modifier(piece.color);
  }

  evaluation += 0.5 * modifier(position.turn);

  return evaluation;
};
