import { Position, PieceType, Color, Piece, Square } from '../types';
import { HEATMAPS } from '../lib/heatmaps';

export const PieceValue: Record<PieceType, number> = Object.freeze({
  [PieceType.Bishop]: 300,
  [PieceType.King]: Infinity,
  [PieceType.Knight]: 300,
  [PieceType.Pawn]: 100,
  [PieceType.Queen]: 900,
  [PieceType.Rook]: 500,
});

const modifier = (color: Color) => (color === Color.White ? 1 : -1);

const squareValue = (square: Square, piece: Piece): number =>
  HEATMAPS[piece.type][piece.color][square];

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

  evaluation += 20 * modifier(position.turn);

  return evaluation / 100;
};
