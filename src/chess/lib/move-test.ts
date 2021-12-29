import { PERFT_5_FEN, STARTING_POSITION_FEN, VIENNA_OPENING_FEN } from './fen';
import Engine from '../engine';
import { Move } from '../types';
import { moveToDirectionString } from '../utils';

export type MoveTest = {
  fen: string;
  counts: number[];
};

export const PERFT_POSITION_5: MoveTest = {
  fen: PERFT_5_FEN,
  counts: [44, 1486, 62379, 2103487, 89941194],
};

export const STARTING_POSITION: MoveTest = {
  fen: STARTING_POSITION_FEN,
  counts: [20, 400, 8902, 197281, 4865609, 119060324],
};

export const VIENNA_OPENING: MoveTest = {
  fen: VIENNA_OPENING_FEN,
  counts: [27, 966, 27249],
};

export const isCountCorrectForDepthFromStart = (
  depth: number,
  count: number,
  test: MoveTest
) => {
  return test.counts[depth - 1] === count;
};

const search = (engine: Engine, depth: number): number => {
  if (depth === 0) {
    return 1;
  }

  let n = 0;

  const movementData = engine.generateMovementData();
  for (const move of movementData.moves) {
    engine.applyMove(move);
    n += search(engine, depth - 1);
    engine.undoLastMove();
  }

  return n;
};

export const run = (engine: Engine, depth: number, debug = false): number => {
  if (depth === 0) {
    return 1;
  }

  const counts: { move: Move; n: number }[] = [];

  const movementData = engine.generateMovementData();
  for (const move of movementData.moves) {
    engine.applyMove(move);
    counts.push({ move, n: search(engine, depth - 1) });
    engine.undoLastMove();
  }

  if (debug) {
    counts.forEach(({ move, n }) => {
      console.log(moveToDirectionString(move), n);
    });
  }

  return counts.reduce((sum, { n }) => sum + n, 0);
};
