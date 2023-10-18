import { Registry, Version } from './registry';
import Engine from '../engine';
import init, { x, Action, createState } from '../lib/uci';
import { ChessComputer } from './chess-computer';
import { UCIResponse } from '../lib/uci/uci-response';

// Class representing a SearchEngine which communicates via the UCI protocol.
//
// This class does not handle UCI messages directly, instead processing UCI
// workflow actions
export class SearchEngine {
  private ai: ChessComputer;
  #emit: (action: Action) => void;

  constructor(
    computer: Version,
    maxDepth: number,
    responseFunc: (response: UCIResponse) => void,
  ) {
    console.log('booting engine');
    this.ai = new Registry[computer](maxDepth);
    x;
    // const x = createState;
    // init;
    // createState;
    // const { emit } = init(createState(), {
    //   engine: new Engine(),
    //   ai: this.ai,
    //   sendUCIResponse: responseFunc,
    // });
    // this.#emit = emit;
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
