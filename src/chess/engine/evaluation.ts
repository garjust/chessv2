import { Position, PieceType, Color, Piece, Square } from '../types';
import { HEATMAPS } from '../lib/heatmaps';

export const HEATMAP_MULTIPLIER = 100;

export const EVALUATION_DIVIDER = 1000;

export const PieceValue: Record<PieceType, number> = Object.freeze({
  [PieceType.Bishop]: 3000,
  [PieceType.King]: Infinity,
  [PieceType.Knight]: 3000,
  [PieceType.Pawn]: 1000,
  [PieceType.Queen]: 9000,
  [PieceType.Rook]: 5000,
});

const modifier = (color: Color) => (color === Color.White ? 1 : -1);

const squareValue = (square: Square, piece: Piece): number =>
  HEATMAPS[piece.type][piece.color][square] * HEATMAP_MULTIPLIER;

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

  evaluation += 200 * modifier(position.turn);

  // Add random jitter to the evaluation. This should be small enough to only
  // break ties in the evaluation. If two moves tie then one will be randomly
  // evaluated as better and will be played instead of the first move evaluated.
  //
  // Choose 4 as the max value so the jitter is always rounded off to 0 when
  // rounding the evaluation number to a real evaluation (divide by 1000).
  evaluation += Math.round(Math.random() * 4);

  return evaluation;
};
