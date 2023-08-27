import Engine from '../engine';
import init, { Action, createState } from '../lib/uci';
import { parse } from '../lib/uci/parse-cli-command';
import { ChessComputer } from './chess-computer';

export class UCIChessComputer {
  ai: ChessComputer;
  emit: (action: Action) => void;

  constructor(
    computer: ChessComputer,
    responseFunc: (response: string) => void
  ) {
    this.ai = computer;
    const { emit } = init(createState(), {
      engine: new Engine(),
      ai: this.ai,
      sendUCIResponse: responseFunc,
    });
    this.emit = emit;
  }

  send(uciMessage: string): void {
    this.emit(parse(uciMessage));
  }

  get diagnosticsResult() {
    return this.ai.diagnosticsResult;
  }

  get label() {
    return this.ai.label;
  }
}
