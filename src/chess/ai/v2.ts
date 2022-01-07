import { ChessComputer } from './types';
import { Move, Piece, PieceType, Position, Square } from '../types';
import { pluck } from '../../lib/array';
import Engine from '../engine';

// Algorithm:
// - pick a random move of a random piece type, because some pieces have move
// moves than others
export default class v2 implements ChessComputer {
  engine: Engine;

  constructor() {
    this.engine = new Engine();
  }

  async nextMove(position: Position) {
    this.engine.position = position;
    const moves = this.engine.generateMoves();

    const captures = moves.filter((move) => move.attack);
    if (captures.length > 0) {
      return pluck(captures);
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
      const movesForPiece = moves.filter(({ from }) => {
        return position.pieces.get(from)?.type === type;
      });

      if (movesForPiece.length) {
        move = pluck(movesForPiece);
      }
    }

    return move;
  }

  toJSON(): string {
    return 'justins chess computer v2';
  }
}
