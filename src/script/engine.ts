import readline from 'readline';
import { open } from 'fs/promises';

import init, { createState } from '../chess/lib/uci';
import { parse } from '../chess/lib/uci/parse-cli-command';
import Engine from '../chess/engine';

const DEBUG_FILE = '/tmp/engine-debug';
const DEBUG = true;

const debugFile = await open(DEBUG_FILE, 'a');
if (DEBUG) {
  debugFile.write(`engine boot\n`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const { emit } = init(createState(), {
  engine: new Engine(),
  sendUCIResponse: rl.write,
});

if (DEBUG) {
  debugFile.write('listening to stin\n');
}

rl.on('line', (line) => {
  if (DEBUG) {
    debugFile.write(`in < "${line}"`);
  }

  const action = parse(line);
  if (DEBUG) {
    debugFile.write(`parsed action: ${action}`);
  }

  emit(action);
});
