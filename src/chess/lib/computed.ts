import { Color, ComputedPositionData, Position } from '../types';
import { board } from './bitmap';
import { evaluate } from './evaluation';
import { computeMovementData } from './move-generation';

export const computeAll = (position: Position): ComputedPositionData => {
  return {
    ...computeMovementData(position),
    evaluation: evaluate(position),
    bitmaps: {
      whitePieces: board(position, { color: Color.White }),
      blackPieces: board(position, { color: Color.Black }),
      // bishops____: board(position, { pieceType: PieceType.Bishop }),
      // kings______: board(position, { pieceType: PieceType.King }),
      // knight_____: board(position, { pieceType: PieceType.Knight }),
      // pawns______: board(position, { pieceType: PieceType.Pawn }),
      // queens_____: board(position, { pieceType: PieceType.Queen }),
      // rooks______: board(position, { pieceType: PieceType.Rook }),
    },
  };
};
