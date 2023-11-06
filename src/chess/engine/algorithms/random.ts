import { Move, Piece, PieceType, Position, Square } from '../../types';
import { pluck } from '../../../lib/array';
import Core from '../../core';
import Diagnotics from '../lib/diagnostics';
import {
  InfoReporter,
  SearchConstructor,
  SearchInterface,
} from '../search-interface';

// Just randomly pick a move, with a tiny bit of intelligence to make
// non-sliding piece moves more often.
export default class Random implements SearchInterface {
  core: Core;
  diagnostics: Diagnotics;

  constructor(_: InfoReporter) {
    this.core = new Core();
    this.diagnostics = new Diagnotics(this.label, 0);
  }

  get diagnosticsResult() {
    return this.diagnostics.result ?? null;
  }

  get label() {
    return 'just-random';
  }

  async nextMove(position: Position) {
    this.core.position = position;
    this.diagnostics = new Diagnotics(this.label, 0);

    let move: Move | undefined;
    const moves = this.core.generateMoves();

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

  ponderMove(_1: Position, _2: Move) {
    throw new Error(`search ${this.label} cannot ponder`);
  }
}
const _: SearchConstructor = Random;
