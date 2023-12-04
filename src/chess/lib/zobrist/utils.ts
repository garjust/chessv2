import { Color, Position } from '../../types';
import { fileIndexForSquare } from '../../utils';
import { CurrentZobrist } from './types';

export const setFromPosition = (
  zobrist: CurrentZobrist,
  position: Position,
) => {
  zobrist.updateCastlingState(position.castlingState);
  if (position.turn === Color.Black) {
    zobrist.updateTurn();
  }
  if (position.enPassantSquare) {
    zobrist.updateEnPassantFile(fileIndexForSquare(position.enPassantSquare));
  }
  for (const [square, piece] of position.pieces) {
    zobrist.updateSquareOccupancy(piece.color, piece.type, square);
  }
};
