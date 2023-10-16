import readline from 'readline';
import { UCICommandAction } from '../chess/lib/uci/action';
import { LATEST, Version } from '../chess/ai/registry';
import { SearchEngine } from '../chess/ai/search-engine';
import { parse } from '../chess/lib/uci/parse-cli-command';
import { UCIResponse, toUCIString } from '../chess/lib/uci/uci-response';

const DEBUG = true;

const SEARCH_VERSION: Version = LATEST;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});
const responseFunc = (response: UCIResponse) => {
  toUCIString(response).map((str: string) => rl.write(`${str}\n`));
};

const searchEngine = new SearchEngine(SEARCH_VERSION, 10, responseFunc);

if (DEBUG) {
  searchEngine.emit(UCICommandAction.debugAction(true));
}

rl.on('line', (line) => {
  const action = parse(line);
  searchEngine.emit(action);
});
