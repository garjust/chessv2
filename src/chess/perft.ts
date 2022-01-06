import { run, VIENNA_OPENING } from './lib/move-generation-perft';
import { argv } from 'process';

const DEBUG = true;

const [, , depth, fen, moves] = argv;
if (DEBUG) {
  console.log('args', depth, fen, moves);
}

run(console.log, VIENNA_OPENING, 4);
