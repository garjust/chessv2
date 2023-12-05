import { expect, test } from 'vitest';
import { FEN_LIBRARY, parseFEN } from '../src/chess/lib/fen';
import { squareLabel } from '../src/chess/utils';
import { moveString } from '../src/chess/move-notation';
import { AlphaBeta, AlphaBetaIterative } from '../src/chess/engine/algorithms';

test('alphaBeta finds checkmate in black mate position', async () => {
  const position = parseFEN(FEN_LIBRARY.BLACK_CHECKMATE_FEN);
  const search = new AlphaBeta(() => {});

  const result = await search.nextMove(position, [], Number.MAX_SAFE_INTEGER, {
    depth: 6,
  });
  const pv = search.diagnosticsResult?.principleVariation;

  expect(moveString(result)).toEqual('g4g1');
  expect(pv).toEqual(['g4g1', 'h1h2', 'd4f3', 'f2f3', 'g6g2']);
});

test.skip('iterative finds checkmate in black mate position', async () => {
  const position = parseFEN(FEN_LIBRARY.BLACK_CHECKMATE_FEN);
  const search = new AlphaBetaIterative(() => {});

  const result = await search.nextMove(position, [], Number.MAX_SAFE_INTEGER, {
    depth: 6,
  });
  const pv = search.diagnosticsResult?.principleVariation;

  expect(moveString(result)).toEqual('g4g1');
  expect(pv).toEqual(['g4g1', 'h1h2', 'd4f3', 'f2f3', 'g6g2']);
});

test('alphaBeta finds checkmate in ladder mate position', async () => {
  const position = parseFEN(FEN_LIBRARY.LADDER_MATE_FEN);
  const search = new AlphaBeta(() => {});

  const result = await search.nextMove(position, [], Number.MAX_SAFE_INTEGER, {
    depth: 6,
  });

  expect(['f6', 'g6', 'h6'].includes(squareLabel(result.to))).toEqual(true);
});

test('alphaBeta finds castle mate', async () => {
  const position = parseFEN('8/8/8/8/8/8/R7/R3K2k w Q - 0 1');
  const search = new AlphaBeta(() => {});

  const result = await search.nextMove(position, [], Number.MAX_SAFE_INTEGER, {
    depth: 6,
  });
  const pv = search.diagnosticsResult?.principleVariation;

  expect(moveString(result)).toEqual('e1c1');
  expect(pv).toEqual(['e1c1']);
});
