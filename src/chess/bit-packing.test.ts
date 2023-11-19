import { expect, test } from 'vitest';
import { moveInt, unpackMove } from './bit-packing';
import { Color, PieceType, Square } from './types';

test('moveInt', () => {
  const move = moveInt(
    Color.White,
    PieceType.Knight,
    20 as Square,
    35 as Square,
  );
  expect(move).toEqual(0b0001000110101000100); // 19 bits

  const unpacked = unpackMove(move);
  expect(unpacked.color).toEqual(Color.White);
  expect(unpacked.pieceType).toEqual(PieceType.Knight);
  expect(unpacked.from).toEqual(20);
  expect(unpacked.to).toEqual(35);
  expect(unpacked.promotion).toEqual(null);
});

test('moveInt with promotion', () => {
  const move = moveInt(
    Color.White,
    PieceType.Knight,
    20 as Square,
    35 as Square,
    PieceType.Queen,
  );
  expect(move).toEqual(0b1011000110101000100);

  const unpacked = unpackMove(move);
  expect(unpacked.color).toEqual(Color.White);
  expect(unpacked.pieceType).toEqual(PieceType.Knight);
  expect(unpacked.from).toEqual(20);
  expect(unpacked.to).toEqual(35);
  expect(unpacked.promotion).toEqual(PieceType.Queen);
});
