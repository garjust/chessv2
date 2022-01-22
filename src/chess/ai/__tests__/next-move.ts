import { BLACK_CHECKMATE_FEN, LADDER_MATE_FEN, parseFEN } from '../../lib/fen';
import { moveString, squareLabel } from '../../utils';
import Iterative from '../algorithms/iterative';
import OrderMoves from '../algorithms/order-moves';

test('alphaBeta finds checkmate in black mate position', async () => {
  const position = parseFEN(BLACK_CHECKMATE_FEN);
  const ai = new OrderMoves(6);

  const result = await ai.nextMove(position);
  const pv = ai.diagnosticsResult?.principleVariation;

  expect(moveString(result)).toEqual('g4g1');
  expect(pv).toEqual(['g4g1', 'h1h2', 'd4f3', 'f2f3', 'g6g2']);
});

// test('iterative finds checkmate in black mate position', async () => {
//   const position = parseFEN(BLACK_CHECKMATE_FEN);
//   const ai = new Iterative(6);

//   const result = await ai.nextMove(position);
//   const pv = ai.diagnosticsResult?.principleVariation;

//   expect(moveString(result)).toEqual('g4g1');
//   expect(pv).toEqual(['g4g1', 'h1h2', 'd4f3', 'f2f3', 'g6g2']);
// });

test('alphaBeta finds checkmate in ladder mate position', async () => {
  const position = parseFEN(LADDER_MATE_FEN);
  const ai = new OrderMoves(6);

  const result = await ai.nextMove(position);

  expect(['f6', 'g6', 'h6'].includes(squareLabel(result.to))).toEqual(true);
});

test('alphaBeta finds castle mate', async () => {
  const position = parseFEN('8/8/8/8/8/8/R7/R3K2k w Q - 0 1');
  const ai = new OrderMoves(2);

  const result = await ai.nextMove(position);
  const pv = ai.diagnosticsResult?.principleVariation;

  expect(moveString(result)).toEqual('e1c1');
  expect(pv).toEqual(['e1c1']);
});
