import { Move, PieceType, Position } from '../../types';

export const nextMove = (position: Position): Move => {
  return {
    from: {
      rank: 3,
      file: 3,
    },
    to: {
      rank: 4,
      file: 3,
    },
  };
};
