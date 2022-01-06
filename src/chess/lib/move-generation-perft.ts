import {
  parseFEN,
  PERFT_5_FEN,
  STARTING_POSITION_FEN,
  VIENNA_OPENING_FEN,
} from './fen';
import Engine from '../engine';
import { moveString } from '../utils';

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
  counts: [27, 966, 27249, 951936, 28181171, 982980787],
};

const isCountCorrectForDepthFromStart = (
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

export const searchRoot = (
  engine: Engine,
  depth: number
): { counter: number; counts: Record<string, number> } => {
  if (depth === 0) {
    return { counter: 1, counts: {} };
  }

  const counts: Record<string, number> = {};

  const moves = engine.generateMoves();
  for (const move of moves) {
    engine.applyMove(move);
    counts[moveString(move, '')] = search(engine, depth - 1);
    engine.undoLastMove();
  }

  return {
    counter: Object.values(counts).reduce((sum, n) => sum + n, 0),
    counts,
  };
};

const NUMBER_FORMATTR = new Intl.NumberFormat();

export const run = (
  logger: (message: string) => void,
  test: MoveTest,
  toDepth: number
): boolean => {
  const position = parseFEN(test.fen);
  const results: { depth: number; passed: boolean }[] = [];
  const perMoveCounters: Record<string, number>[] = [];

  for (let i = 1; i <= toDepth; i++) {
    const start = Date.now();
    const engine = new Engine(position);
    const { counter, counts } = searchRoot(engine, i);
    const timing = Date.now() - start;

    const passed = isCountCorrectForDepthFromStart(i, counter, test);
    perMoveCounters[i] = counts;

    logger(
      `depth=${i}; passed=${
        passed ? 'yes' : 'no '
      }; count=${NUMBER_FORMATTR.format(counter)}; timing=${timing}ms (${(
        (timing / counter) *
        1000
      ).toPrecision(5)}μs/node)`
    );
    results.push({ depth: i, passed });
  }
  logger('--');

  // console.log('full counts by move', perMoveCounters);

  return results.every((result) => result.passed);
};
