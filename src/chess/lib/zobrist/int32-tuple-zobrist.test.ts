import { expect, test } from 'vitest';
import { Color, PieceType } from '../../types';
import { squareOccupancyIndex } from './int32-tuple-zobrist';

test('squareOccupancyIndex', () => {
  expect(squareOccupancyIndex(Color.White, PieceType.Pawn, 0)).toEqual(25);
  expect(squareOccupancyIndex(Color.Black, PieceType.Pawn, 0)).toEqual(409);
  expect(squareOccupancyIndex(Color.Black, PieceType.King, 63)).toEqual(792); // N - 1
});
