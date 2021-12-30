import {
  AttackObject,
  Color,
  Position as ExternalPosition,
  Square,
} from '../types';
import { copyPosition, findKing } from '../utils';

export type Position = ExternalPosition & {
  kings: {
    [Color.White]?: Square;
    [Color.Black]?: Square;
  };

  attacked: {
    [Color.White]: Square[];
    [Color.Black]: Square[];
  };

  pinsToKing: {
    [Color.White]: Map<Square, AttackObject>;
    [Color.Black]: Map<Square, AttackObject>;
  };
};

const convertToInternal = (position: ExternalPosition): Position => {
  const whiteKing = findKing(position, Color.White);
  const blackKing = findKing(position, Color.Black);

  const kings = {
    [Color.White]: whiteKing,
    [Color.Black]: blackKing,
  };
  const attacked = {
    [Color.White]: [],
    [Color.Black]: [],
  };
  const pinsToKing = {
    [Color.White]: new Map<Square, AttackObject>(),
    [Color.Black]: new Map<Square, AttackObject>(),
  };

  return { ...position, kings, attacked, pinsToKing };
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
