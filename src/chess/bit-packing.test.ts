import { expect, test } from 'vitest';
import { moveInt, unpackMove } from './bit-packing';
import { Color, PieceType } from './types';

test('moveInt', () => {
  const move = moveInt(Color.White, PieceType.Knight, 20, 35);
  expect(move).toEqual(0b01000110101000100);

  const unpacked = unpackMove(move);
  expect(unpacked.color).toEqual(Color.White);
  expect(unpacked.pieceType).toEqual(PieceType.Knight);
  expect(unpacked.from).toEqual(20);
  expect(unpacked.to).toEqual(35);
});
