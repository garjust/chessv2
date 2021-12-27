import { ChessComputer } from './types';
import { Move, Piece, PieceType, Position, Square } from '../types';
import { pluck } from '../../lib/array';
import engine from '../engine';

// Algorithm:
// - pick a random move of a random piece type, because some pieces have move
// moves than others
export default class v2 implements ChessComputer<Position> {
  nextMove(position: Position) {
    const movementData = engine.generateMovementData(position);

    if (movementData.availableCaptures.length) {
      return Promise.resolve(pluck(movementData.availableCaptures));
    }

    const pieces: { square: Square; piece: Piece }[] = [];
    for (const [square, piece] of position.pieces.entries()) {
      if (piece.color === position.turn) {
        pieces.push({ square, piece });
      }
    }

    let move: Move | undefined;
    const types = [
      PieceType.Bishop,
      PieceType.King,
      PieceType.Knight,
      PieceType.Pawn,
      PieceType.Queen,
      PieceType.Rook,
    ];

    while (move === undefined) {
      const type = pluck(types);
      const moves = movementData.moves.filter(({ from }) => {
        return position.pieces.get(from)?.type === type;
      });

      if (moves.length) {
        move = pluck(moves);
      }
    }

    return Promise.resolve(move);
  }

  toJSON(): string {
    return 'justins chess computer v2';
  }
}
