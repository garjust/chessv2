import { parseFEN, FEN_LIBRARY } from './fen';
import Core from '../core';
import { moveString } from '../move-notation';
import { formatNumber } from '../../lib/formatter';

export type MoveTest = {
  fen: string;
  counts: number[];
};

export const TestFens: Record<string, MoveTest> = {
  PERFT_POSITION_5: {
    fen: FEN_LIBRARY.PERFT_5_FEN,
    counts: [44, 1486, 62379, 2103487, 89941194],
  },
  STARTING_POSITION: {
    fen: FEN_LIBRARY.STARTING_POSITION_FEN,
    counts: [20, 400, 8902, 197281, 4865609, 119060324],
  },
  VIENNA_OPENING: {
    fen: FEN_LIBRARY.VIENNA_OPENING_FEN,
    counts: [27, 966, 27249, 951936, 28181171, 982980787],
  },
  BLACK_CHECKMATE: {
    fen: FEN_LIBRARY.BLACK_CHECKMATE_FEN,
    counts: [30, 847, 24516, 666062, 18526901, 493165553],
  },
};

const isCountCorrectForDepthFromStart = (
  depth: number,
  count: number,
  test: MoveTest,
) => {
  return test.counts[depth - 1] === count;
};

const search = (engine: Core, depth: number): number => {
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
  engine: Core,
  depth: number,
): { counter: number; counts: Record<string, number> } => {
  const counts: Record<string, number> = {};
  let counter = 0;

  const moves = engine.generateMoves();
  for (const move of moves) {
    engine.applyMove(move);
    const x = search(engine, depth - 1);
    engine.undoLastMove();

    counts[moveString(move)] = x;
    counter += x;
  }

  return {
    counter,
    counts,
  };
};

export const run = (
  logger: (message: string) => void,
  test: MoveTest,
  toDepth: number,
): boolean => {
  const position = parseFEN(test.fen);
  const results: { depth: number; passed: boolean }[] = [];

  for (let i = 1; i <= toDepth; i++) {
    const engine = new Core(position);
    const start = Date.now();
    const { counter } = searchRoot(engine, i);
    const timing = Date.now() - start;

    const passed = isCountCorrectForDepthFromStart(i, counter, test);

    logger(
      `depth=${i}; passed=${passed ? 'yes' : 'no '}; count=${formatNumber(
        counter,
      )}; timing=${formatNumber(timing)}ms (${(
        (timing / counter) *
        1000
      ).toPrecision(5)}μs/node)`,
    );
    results.push({ depth: i, passed });
  }
  logger('--');

  return results.every((result) => result.passed);
};
