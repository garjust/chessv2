import { SearchExecutorI } from '../search-executor';
import { Move, Piece, PieceType, Position, Square } from '../../types';
import { pluck } from '../../../lib/array';
import Core from '../../core';
import Diagnotics from '../lib/diagnostics';

// Just randomly pick a move, with a tiny bit of intelligence to make
// non-sliding piece moves more often.
export default class Random implements SearchExecutorI {
  engine: Core;
  diagnostics: Diagnotics;

  constructor() {
    this.engine = new Core();
    this.diagnostics = new Diagnotics(this.label, 0);
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'just-random';
  }

  async nextMove(position: Position) {
    this.engine.position = position;
    this.diagnostics = new Diagnotics(this.label, 0);

    let move: Move | undefined;
    const moves = this.engine.generateMoves();

    const captures = moves.filter((move) => move.attack);
    if (captures.length > 0) {
      move = pluck(captures);
    }

    const pieces: { square: Square; piece: Piece }[] = [];
    for (const [square, piece] of position.pieces.entries()) {
      if (piece.color === position.turn) {
        pieces.push({ square, piece });
      }
    }

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

    this.diagnostics.recordResult({
      move,
      pv: [move],
      bestScore: { move, score: 0 },
      scores: moves.map((move) => ({ move, score: 0 })),
    });
    return move;
  }
}
