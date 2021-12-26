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

  async nextMove(fen: string): Promise<Move> {
    if (!this.#instance) {
      throw Error('no computer is loaded');
    }

    console.log('sent move request');
    const before = Date.now();
    const position = parseFEN(fen);
    const move = await this.#instance.nextMove(position);
    const timing = Date.now() - before;
    console.log(`received move after ${timing}ms`);
    return move;
  }
}

expose(ChessComputerWorker);