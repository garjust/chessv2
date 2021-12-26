import { ChessComputer } from './types';
import { Piece, Position, Square } from '../types';
import { computeAll } from '../engine/computed';
import { pluck } from '../../lib/array';

export default class v2 implements ChessComputer<Position> {
  nextMove(position: Position) {
    const computedPositionData = computeAll(position);

    if (computedPositionData.availableChecks.length) {
      return Promise.resolve(pluck(computedPositionData.availableChecks));
    }

    if (computedPositionData.availableCaptures.length) {
      return Promise.resolve(pluck(computedPositionData.availableCaptures));
    }

    const pieces: { square: Square; piece: Piece }[] = [];
    for (const [square, piece] of position.pieces.entries()) {
      if (piece.color === position.turn) {
        pieces.push({ square, piece });
      }
    }

    const piece = pluck(pieces);
    const moves = computedPositionData.moves.filter(
      ({ from }) => from === piece.square
    );

    return Promise.resolve(pluck(moves));
  }

  toJSON(): string {
    return 'justins chess computer v2';
  }
}
