import { SquareMap } from '../square-map';
import { Color, Piece, Position, Square } from '../types';

export const copyPosition = (position: Position): Position => {
  const pieces = new SquareMap<Piece>();
  for (const [key, value] of position.pieces) {
    pieces.set(key, value);
  }

  const castlingAvailability = {
    [Color.White]: {
      kingside: position.castlingAvailability[Color.White].kingside,
      queenside: position.castlingAvailability[Color.White].queenside,
    },
    [Color.Black]: {
      kingside: position.castlingAvailability[Color.Black].kingside,
      queenside: position.castlingAvailability[Color.Black].queenside,
    },
  };

  let enPassantSquare: Square | null = null;
  if (position.enPassantSquare) {
    enPassantSquare = { ...position.enPassantSquare };
  }

  return {
    pieces,
    turn: position.turn,
    castlingAvailability,
    enPassantSquare,
    halfMoveCount: position.halfMoveCount,
    fullMoveCount: position.fullMoveCount,
  };
};
