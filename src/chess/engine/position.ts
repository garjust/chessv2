import { Color, Position as ExternalPosition } from '../types';
import { copyPosition, findKing } from '../utils';
import AttackMap from './attack-map';
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

  const attackedSquares = {
    [Color.White]: new AttackMap(position, Color.White),
    [Color.Black]: new AttackMap(position, Color.Black),
  };

  const pinsToKing = findPinsOnKings(position.pieces, kings);

  const checks = findChecksOnKings(position.pieces, kings, {
    enPassantSquare: position.enPassantSquare,
    castlingAvailability: position.castlingAvailability,
  });

  return {
    ...position,
    kings,
    attackedSquares,
    checks,
    pinsToKing,
  };
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
