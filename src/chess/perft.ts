import { searchRoot } from './lib/move-generation-perft';
import { argv } from 'process';
import { parseFEN } from './lib/fen';
import Engine from './engine';
import { moveFromString } from './utils';

const DEBUG = false;

const [, , depth, fen, movesString] = argv;
if (DEBUG) {
  console.log('args', depth, fen, movesString);
}

const position = parseFEN(fen);
if (DEBUG) {
  console.log('parsed position', position);
}

const moveList =
  movesString.length === 0
    ? []
    : movesString.split(' ').map((moveString) => moveFromString(moveString));
if (DEBUG) {
  console.log('parsed moves', moveList);
}

const engine = new Engine(position);

for (const move of moveList) {
  engine.applyMove(move);
}

const results = searchRoot(engine, Number(depth));

for (const [move, count] of Object.entries(results.counts)) {
  console.log(`${move} ${count}`);
}

console.log(`\n${results.counter}`);
