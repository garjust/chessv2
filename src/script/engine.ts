import readline from 'readline';
import { LATEST, Version } from '../chess/engine/registry';
import { Engine } from '../chess/engine/engine';
import { parse } from '../chess/engine/workflow/parse-cli-command';
import { UCIResponse, toUCI } from '../chess/engine/workflow/uci-response';
import { debugAction } from '../chess/engine/workflow';

const DEBUG = true;

const SEARCH_VERSION: Version = LATEST;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});
const responseFunc = (response: UCIResponse) => {
  toUCI(response).map((str: string) => rl.write(`${str}\n`));
};

const searchEngine = new Engine(SEARCH_VERSION, 10, responseFunc);

if (DEBUG) {
  searchEngine.emit(debugAction(true));
}

rl.on('line', (line) => {
  const action = parse(line);
  searchEngine.emit(action);
});
