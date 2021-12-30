import { Color, Position as ExternalPosition, Square } from '../types';
import { copyPosition, findKing } from '../utils';
import { pinsToSquare } from './move-generation';
import { Pin, Position } from './types';

const convertToInternal = (position: ExternalPosition): Position => {
  const whiteKing = findKing(position, Color.White);
  const blackKing = findKing(position, Color.Black);

  let whitePins;
  let blackPins;

  if (whiteKing) {
    whitePins = pinsToSquare(position.pieces, whiteKing, Color.White);
  }
  if (blackKing) {
    blackPins = pinsToSquare(position.pieces, blackKing, Color.Black);
  }

  const kings = {
    [Color.White]: whiteKing,
    [Color.Black]: blackKing,
  };
  const attacked = {
    [Color.White]: [],
    [Color.Black]: [],
  };
  const pinsToKing = {
    [Color.White]: whitePins ? whitePins : new Map<Square, Pin>(),
    [Color.Black]: blackPins ? blackPins : new Map<Square, Pin>(),
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
