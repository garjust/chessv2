import { Position, PieceType, Color, Piece, Square } from '../types';
import { squareValue } from '../lib/heatmaps';
import { rankForSquare } from '../utils';

// Evaluation is typically based on the value of a pawn = 1. Evaluation is calculated
// here with a 1000 multiplier to avoid floating points and to allow us to add
// a small amount of random noise if we desire.
export const EVALUATION_DIVIDER = 1000;

export const DOUBLED_PAWN_PENALTY = 100;
export const INITIATIVE_SCORE = 200;

export const PieceValue: Record<PieceType, number> = Object.freeze({
  [PieceType.Bishop]: 3000,
  [PieceType.King]: Infinity,
  [PieceType.Knight]: 3000,
  [PieceType.Pawn]: 1000,
  [PieceType.Queen]: 9000,
  [PieceType.Rook]: 5000,
});

export const MATE_SCORE = PieceValue[PieceType.Queen] * 20;
export const DRAW_SCORE = 0;

const modifier = (color: Color) => (color === Color.White ? 1 : -1);

export const evaluate = (position: Position): number => {
  let evaluation = 0;

  const pawnInFileCounts = {
    [Color.White]: [0, 0, 0, 0, 0, 0, 0, 0],
    [Color.Black]: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  for (const [square, piece] of position.pieces) {
    if (piece.type === PieceType.King) {
      continue;
    }
    if (piece.type === PieceType.Pawn) {
      pawnInFileCounts[piece.color][rankForSquare(square)]++;
    }

    evaluation +=
      (PieceValue[piece.type] + squareValue(square, piece)) *
      modifier(piece.color);
  }

  for (let i = 0; i < 8; i++) {
    if (pawnInFileCounts[Color.White][i] > 1) {
      evaluation -= DOUBLED_PAWN_PENALTY;
    }
    if (pawnInFileCounts[Color.Black][i] > 1) {
      evaluation += DOUBLED_PAWN_PENALTY;
    }
  }

  // Points for being player to move.
  evaluation += INITIATIVE_SCORE * modifier(position.turn);

  // Add random jitter to the evaluation. This should be small enough to only
  // break ties in the evaluation. If two moves tie then one will be randomly
  // evaluated as better and will be played instead of the first move evaluated.
  //
  // Choose 4 as the max value so the jitter is always rounded off to 0 when
  // rounding the evaluation number to a real evaluation (divide by 1000).
  // evaluation += Math.random();

  return evaluation;
};
