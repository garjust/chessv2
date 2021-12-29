import { Color, Position as ExternalPosition, Square } from '../types';
import { copyPosition, findKing } from '../utils';

export type Position = ExternalPosition & {
  kings: {
    [Color.White]?: Square;
    [Color.Black]?: Square;
  };
};

const convertToInternal = (position: ExternalPosition): Position => {
  const whiteKing = findKing(position, Color.White);
  const blackKing = findKing(position, Color.Black);

  const kings = {
    [Color.White]: whiteKing,
    [Color.Black]: blackKing,
  };

  return { ...position, kings };
};

const convertToExternal = (position: Position): ExternalPosition => {
  const {
    pieces,
    turn,
    castlingAvailability,
    enPassantSquare,
    halfMoveCount,
    fullMoveCount,
  } = position;
  return {
    pieces,
    turn,
    castlingAvailability,
    enPassantSquare,
    halfMoveCount,
    fullMoveCount,
  };
};

export const copyToInternal = (position: ExternalPosition): Position =>
  convertToInternal(copyPosition(position));

export const copyToExternal = (position: Position): ExternalPosition =>
  copyPosition(convertToExternal(position));
