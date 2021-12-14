import { Move, PieceType, Position } from '../../types';

export const nextMove = (position: Position): Move => {
  return {
    pieceAndSquare: {
      piece: {
        type: PieceType.Pawn,
        color: position.turn,
      },
      squareDef: {
        rank: 3,
        file: 3,
      },
    },
    square: {
      rank: 4,
      file: 3,
    },
  };
};
