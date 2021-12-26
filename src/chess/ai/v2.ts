import { ChessComputer } from './types';
import { Piece, Position, Square } from '../types';
import { pluck } from '../../lib/array';
import engine from '../engine';

export default class v2 implements ChessComputer<Position> {
  nextMove(position: Position) {
    const movementData = engine.generateMovementData(position);

    if (movementData.availableChecks.length) {
      return Promise.resolve(pluck(movementData.availableChecks));
    }

    if (movementData.availableCaptures.length) {
      return Promise.resolve(pluck(movementData.availableCaptures));
    }

    const pieces: { square: Square; piece: Piece }[] = [];
    for (const [square, piece] of position.pieces.entries()) {
      if (piece.color === position.turn) {
        pieces.push({ square, piece });
      }
    }

    const piece = pluck(pieces);
    const moves = movementData.moves.filter(
      ({ from }) => from === piece.square
    );

    return Promise.resolve(pluck(moves));
  }

  toJSON(): string {
    return 'justins chess computer v2';
  }
}
