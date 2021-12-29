import { threadId } from 'worker_threads';
import { ComputedMovementData, Move, Piece, Position } from '../types';
import { copyPosition } from './copy';
import { evaluate } from './evaluation';
import { applyMove } from './move-execution';
import { generateMovementData } from './move-generation';

export default class Engine {
  #position: Position;

  constructor(position: Position) {
    this.#position = copyPosition(position);
  }

  applyMove(move: Move): Piece | undefined {
    const { position, captured } = applyMove(this.#position, move);
    this.#position = position;
    return captured;
  }

  undoLastMove() {
    throw Error('unimplemented');
  }

  evaluate(): number {
    return evaluate(this.#position);
  }

  generateMoves(): Move[] {
    return this.generateMovementData().moves;
  }

  generateMovementData(): ComputedMovementData {
    return generateMovementData(this.#position);
  }

  get position(): Position {
    return copyPosition(this.#position);
  }
}

export const ImmutableEngine = {
  applyMove,
  evaluate,
  generateMoves: (position: Position) => generateMovementData(position).moves,
  generateMovementData,
};
