import { Color, Position as ExternalPosition, Square } from '../types';
import { findKing } from '../utils';

export type Position = ExternalPosition & {
  kings: {
    [Color.White]?: Square;
    [Color.Black]?: Square;
  };
};

export const convertToInternal = (position: ExternalPosition): Position => {
  const whiteKing = findKing(position, Color.White);
  const blackKing = findKing(position, Color.Black);

  const kings = {
    [Color.White]: whiteKing,
    [Color.Black]: blackKing,
  };

  return { ...position, kings };
};
