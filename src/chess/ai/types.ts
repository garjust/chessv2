import { Move } from '../types';

export type AvailableComputerVersions = 'v1' | 'v2' | 'v3' | 'v4';

export interface ChessComputer<P> {
  nextMove(position: P): Promise<Move>;
}

export interface ChessComputerConstructor<P> {
  new (): ChessComputer<P>;
}

export interface ChessComputerWorker {
  load(version: AvailableComputerVersions): void;
  // The chess computer worker provides a FEN string interface to simplify
  // copying of the position into the Worker.
  nextMove(fen: string): Promise<Move>;
}

export interface ChessComputerWorkerConstructor {
  new (): ChessComputerWorker;
}
