import {
  parseFEN,
  PERFT_5_FEN,
  STARTING_POSITION_FEN,
  VIENNA_OPENING_FEN,
} from './fen';
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
  const moves = engine.generateMoves();

  if (depth === 0) {
    return 1;
  } else if (depth === 1) {
    return moves.length;
  }

  let n = 0;

  for (const move of moves) {
    engine.applyMove(move);
    n += search(engine, depth - 1);
    engine.undoLastMove();
  }

  return n;
};

const searchRoot = (engine: Engine, depth: number, debug: boolean): number => {
  if (depth === 0) {
    return 1;
  }

  const counts: { move: Move; n: number }[] = [];

  const moves = engine.generateMoves();
  for (const move of moves) {
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

const NUMBER_FORMATTR = new Intl.NumberFormat();

export const run = (
  logger: (message: string) => void,
  test: MoveTest,
  toDepth: number,
  debug: boolean
): boolean => {
  const position = parseFEN(test.fen);
  const results: { depth: number; passed: boolean }[] = [];

  for (let i = 1; i <= toDepth; i++) {
    const start = Date.now();
    const engine = new Engine(position);
    const count = searchRoot(engine, i, debug);
    const timing = Date.now() - start;
    const passed = isCountCorrectForDepthFromStart(i, count, test);

    logger(
      `depth=${i}; passed=${
        passed ? 'yes' : 'no'
      }; count=${NUMBER_FORMATTR.format(count)}; timing=${timing}ms (${(
        (timing / count) *
        1000
      ).toPrecision(5)}μs/node)`
    );
    results.push({ depth: i, passed });
  }
  logger('--');

  return results.every((result) => result.passed);
};
