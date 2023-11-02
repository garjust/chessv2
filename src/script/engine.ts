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

const searchEngine = new Engine(SEARCH_VERSION, 10);

searchEngine.responses.subscribe((response: UCIResponse) => {
  toUCI(response).map((str: string) => rl.write(`${str}\n`));
});

if (DEBUG) {
  searchEngine.workflow.emit(debugAction(true));
}

rl.on('line', (line) => {
  const action = parse(line);
  searchEngine.workflow.emit(action);
});
