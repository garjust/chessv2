import readline from 'readline';
import { LATEST } from '../chess/engine/search-executor';
import { Version } from '../chess/engine/search-executor';
import { Engine } from '../chess/engine/engine';
import { parse } from '../chess/engine/workflow/parse-cli-command';
import { UCIResponse, toUCI } from '../chess/engine/workflow/uci-response';
import { debugAction } from '../chess/engine/workflow';

const DEBUG = true;

const ENGINE_VERSION: Version = LATEST;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const engine = new Engine(ENGINE_VERSION);

engine.responses.subscribe((response: UCIResponse) => {
  toUCI(response).map((str: string) => rl.write(`${str}\n`));
});

if (DEBUG) {
  engine.workflow.emit(debugAction(true));
}

rl.on('line', (line) => {
  const action = parse(line);
  engine.workflow.emit(action);
});
