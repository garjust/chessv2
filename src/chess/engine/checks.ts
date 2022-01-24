import {
  CastlingAvailability,
  Color,
  Move,
  Piece,
  PieceType,
  Square,
  SquareControlObject,
} from '../types';
import { flipColor } from '../utils';
import { attacksOnSquare } from './attacks';
import { KingChecks, KingSquares } from './types';

export const findChecksOnKing = (
  pieces: Map<Square, Piece>,
  king: Square | undefined,
  color: Color,
  options: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): SquareControlObject[] => {
  if (!king) {
    return [];
  }

  const attackObjects = attacksOnSquare(pieces, flipColor(color), king, {
    ...options,
    skip: [king],
  });

  return attackObjects.map((attackObject) => ({
    attacker: attackObject.attacker,
    square: attackObject.attacked.square,
    slideSquares: attackObject.slideSquares,
  }));
};

export const findChecksOnKings = (
  pieces: Map<Square, Piece>,
  kings: KingSquares,
  options: {
    enPassantSquare: Square | null;
    castlingAvailability: CastlingAvailability;
  }
): KingChecks => {
  const whiteKing = kings[Color.White];
  const blackKing = kings[Color.Black];

  const whiteChecks = findChecksOnKing(pieces, whiteKing, Color.White, options);
  const blackChecks = findChecksOnKing(pieces, blackKing, Color.Black, options);

  return {
    [Color.White]: whiteChecks,
    [Color.Black]: blackChecks,
  };
};
