import { Registry, Version } from './registry';
import Core from '../core';
import init, { Action, createState } from './uci';
import { SearchExecutorI } from './search-executor';
import { UCIResponse } from './uci/uci-response';

// Class representing a chess engine which communicates via the UCI protocol.
//
// This class does not handle UCI messages directly, instead processing UCI
// workflow actions.
export class Engine {
  private ai: SearchExecutorI;
  #emit: (action: Action) => void;

  constructor(
    computer: Version,
    maxDepth: number,
    responseFunc: (response: UCIResponse) => void,
  ) {
    console.log('booting engine');
    this.ai = new Registry[computer](maxDepth);
    const { emit } = init(createState(), {
      engine: new Core(),
      ai: this.ai,
      sendUCIResponse: responseFunc,
    });
    this.#emit = emit;
  }

  emit(action: Action) {
    this.#emit(action);
  }

  get diagnosticsResult() {
    return this.ai.diagnosticsResult;
  }

  get label() {
    return this.ai.label;
  }
}
