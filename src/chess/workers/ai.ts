import { expose } from 'comlink';
import { ComputerRegistry } from '../ai';
import {
  AvailableComputerVersions,
  ChessComputer,
  ChessComputerWorker as IChessComputerWorker,
} from '../ai/types';
import { parseFEN } from '../lib/fen';
import { Move, Position } from '../types';

class ChessComputerWorker implements IChessComputerWorker {
  #instance?: ChessComputer<Position>;

  load(version: AvailableComputerVersions) {
    switch (version) {
      case 'v1':
        this.#instance = new ComputerRegistry.v1();
        break;
      case 'v2':
        this.#instance = new ComputerRegistry.v2();
        break;
      case 'v3':
        this.#instance = new ComputerRegistry.v3();
        break;
    }
  }

  nextMove(fen: string): Promise<Move> {
    if (!this.#instance) {
      throw Error('no computer is loaded');
    }

    const position = parseFEN(fen);
    return this.#instance.nextMove(position);
  }
}

expose(ChessComputerWorker);
