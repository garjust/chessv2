import { expect, test } from 'vitest';
import { CastlingState, Color, PieceType } from '../../types';
import { Int32TupleZobrist, squareOccupancyIndex } from './int32-tuple-zobrist';

test('squareOccupancyIndex', () => {
  expect(squareOccupancyIndex(Color.White, PieceType.Pawn, 0)).toEqual(25);
  expect(squareOccupancyIndex(Color.Black, PieceType.Pawn, 0)).toEqual(409);
  expect(squareOccupancyIndex(Color.Black, PieceType.King, 63)).toEqual(792); // N - 1
});

test('push and pop key stack', () => {
  const zobrist = new Int32TupleZobrist();

  zobrist.pushKey();
  zobrist.updateCastlingState(CastlingState.Kingside);
  zobrist.updateCastlingState(CastlingState.Black_OO);
  const key1 = zobrist.key;
  zobrist.pushKey();
  zobrist.updateTurn();
  const key2 = zobrist.key;
  zobrist.pushKey();

  expect(zobrist.key).toEqual(key2);
  zobrist.popKey();
  expect(zobrist.key).toEqual(key2);
  zobrist.popKey();
  expect(zobrist.key).toEqual(key1);
  zobrist.popKey();
  expect(zobrist.key).toEqual([0, 0]);
});
