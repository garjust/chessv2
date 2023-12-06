import { expect, test } from 'vitest';
import { entryMeta, entryMove, unpackEntry } from './entry';
import { NodeType, TranspositionTableEntry } from '../../types';
import { PieceType } from '../../../types';

const ALL_ENTRY: TranspositionTableEntry = {
  nodeType: NodeType.All,
  inverseDepth: 5,
  score: 120,
  move: { from: 23, to: 24 },
};
const PV_ENTRY: TranspositionTableEntry = {
  nodeType: NodeType.PV,
  inverseDepth: 12,
  score: 143243,
  move: { from: 0, to: 1 },
};
const CUT_ENTRY: TranspositionTableEntry = {
  nodeType: NodeType.Cut,
  inverseDepth: 1,
  score: 55,
  move: { from: 53, to: 35, promotion: PieceType.Knight },
};
const NO_MOVE_ENTRY: TranspositionTableEntry = {
  nodeType: NodeType.All,
  inverseDepth: 2,
  score: 77,
};

test('entryMeta', () => {
  expect(entryMeta(ALL_ENTRY)).toEqual(0b11110000000010110);
  expect(entryMeta(PV_ENTRY)).toEqual(0b1000101111100010110000110000);
});

test('entryMove', () => {
  expect(entryMove(ALL_ENTRY)).toEqual(0b011000010111);
  expect(entryMove(PV_ENTRY)).toEqual(0b000001000000);
  expect(entryMove(CUT_ENTRY)).toEqual(0b10100011110101);
  expect(entryMove(NO_MOVE_ENTRY)).toEqual(0);
});

test('unpackEntry', () => {
  expect(
    unpackEntry(0b11110000000010110, 0b011000010111),
  ).toEqual<TranspositionTableEntry>({
    nodeType: NodeType.All,
    inverseDepth: 5,
    score: 120,
    move: { from: 23, to: 24, promotion: PieceType.Null },
  });
});
