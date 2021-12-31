import { Color, Position as ExternalPosition, Square } from '../types';
import { copyPosition, findKing } from '../utils';
import { findChecksOnKings } from './checks';
import { findPinsOnKings } from './pins';
import { KingSquares, Position } from './types';

const convertToInternal = (position: ExternalPosition): Position => {
  const whiteKing = findKing(position, Color.White);
  const blackKing = findKing(position, Color.Black);
  const kings: KingSquares = {
    [Color.White]: whiteKing,
    [Color.Black]: blackKing,
  };

  const pinsToKing = findPinsOnKings(position.pieces, kings);

  const checks = findChecksOnKings(position.pieces, kings, {
    enPassantSquare: position.enPassantSquare,
    castlingAvailability: position.castlingAvailability,
  });

  const attacked = {
    [Color.White]: [],
    [Color.Black]: [],
  };

  return { ...position, kings, attacked, checks, pinsToKing };
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
