import { Registry, Version } from './registry';
import Core from '../core';
import init, { Action, createState } from './workflow';
import { SearchExecutorI } from './search-executor';
import { UCIResponse } from './workflow/uci-response';

// Class representing a chess engine which communicates via the UCI protocol.
//
// This class does not handle UCI messages directly, instead processing UCI
// workflow actions.
export class Engine {
  private searchExecutor: SearchExecutorI;
  #emit: (action: Action) => void;

  constructor(
    computer: Version,
    maxDepth: number,
    responseFunc: (response: UCIResponse) => void,
  ) {
    console.log('booting engine');
    this.searchExecutor = new Registry[computer](maxDepth);
    const { emit } = init(createState(), {
      engine: new Core(),
      ai: this.searchExecutor,
      sendUCIResponse: responseFunc,
    });
    this.#emit = emit;
  }

  emit(action: Action) {
    this.#emit(action);
  }

  get diagnosticsResult() {
    return this.searchExecutor.diagnosticsResult;
  }

  get label() {
    return this.searchExecutor.label;
  }
}
