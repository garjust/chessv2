import { ChessComputer } from './types';
import { Move, Piece, PieceType, Position, Square } from '../types';
import { pluck } from '../../lib/array';
import Engine from '../engine';
import Diagnotics from './search/diagnostics';

export default class v2 implements ChessComputer {
  engine: Engine;
  diagnostics: Diagnotics;

  constructor() {
    this.engine = new Engine();
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

    this.diagnostics.recordResult(
      move,
      moves.map((move) => ({ move, score: 0 }))
    );
    return move;
  }
}
