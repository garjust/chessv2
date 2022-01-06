import { searchRoot } from './lib/move-generation-perft';
import { argv } from 'process';
import { parseFEN } from './lib/fen';
import Engine from './engine';

const DEBUG = false;

const [, , depth, fen, moves] = argv;
if (DEBUG) {
  console.log('args', depth, fen, moves);
}

const position = parseFEN(fen);
if (DEBUG) {
  console.log('parsed position', position);
}

const engine = new Engine(position);
const results = searchRoot(engine, Number(depth));

for (const [move, count] of Object.entries(results.counts)) {
  console.log(`${move} ${count}`);
}

console.log(`\n${results.counter}`);
