import { searchRoot } from './lib/move-generation-perft';
import { argv } from 'process';
import { parseFEN } from './lib/fen';
import Engine from './engine';
import { moveFromString, moveString } from './utils';
import { open } from 'fs/promises';

const DEBUG_FILE = '/tmp/perft-debug';
const DEBUG = true;

const debugFile = await open(DEBUG_FILE, 'a');

const [, , depth, fen, movesString] = argv;
if (DEBUG) {
  debugFile.write(`PERFT CALL ===================\n`);
  debugFile.write(`args ${depth} ${fen} ${movesString}\n`);
}

const position = parseFEN(fen);

const moveList =
  movesString.length === 0
    ? []
    : movesString.split(' ').map((moveString) => moveFromString(moveString));
if (DEBUG) {
  debugFile.write(
    `parsed moves: ${moveList.map((move) => moveString(move)).join('-')}\n`
  );
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

debugFile.close();
