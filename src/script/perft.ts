import { searchRoot } from '../chess/lib/perft';
import { argv } from 'process';
import { open } from 'fs/promises';

import { parseFEN, isValid } from '../chess/lib/fen';
import Core from '../chess/core';
import { moveFromString, moveString } from '../chess/move-notation';

const DEBUG_FILE = '/tmp/perft-debug';
const DEBUG = true;

const debugFile = await open(DEBUG_FILE, 'a');

const [, , depth, fen, movesString] = argv;

if (depth.length == 0) {
  throw Error('perft was not passed a search depth');
}
if (fen.length == 0) {
  throw Error('perft was not passed a FEN string');
}
if (!isValid(fen)) {
  throw Error(`perft was not passed a valid FEN: "${fen}"`);
}

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
    `parsed moves: ${moveList.map((move) => moveString(move)).join('-')}\n`,
  );
}

const engine = new Core(position);

for (const move of moveList) {
  engine.applyMove(move);
}

const results = searchRoot(engine, Number(depth));

for (const [move, count] of Object.entries(results.counts)) {
  console.log(`${move} ${count}`);
}

console.log(`\n${results.counter}`);

debugFile.close();
