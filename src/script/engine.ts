import readline from 'readline';
import init, { createState } from '../chess/lib/uci';
import { parse } from '../chess/lib/uci/parse-cli-command';
import Engine from '../chess/engine';
import { UCICommandAction } from '../chess/lib/uci/action';
import Iterative from '../chess/ai/algorithms/iterative';

const DEBUG = true;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const { emit } = init(createState(), {
  engine: new Engine(),
  ai: new Iterative(10),
  sendUCIResponse: (response: string) => rl.write(`${response}\n`),
});

if (DEBUG) {
  emit(UCICommandAction.debugAction(true));
}

rl.on('line', (line) => {
  const action = parse(line);
  emit(action);
});
