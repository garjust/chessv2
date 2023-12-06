import { expect, test } from 'vitest';
import TTableArrayBuffer from './ttable-array-buffer';
import { CurrentZobrist } from '../../../lib/zobrist/types';
import { NodeType, TranspositionTableEntry } from '../../types';
import { PieceType } from '../../../types';

/**
 * Current zobrist for testing. Exposes the zobrist key for manually editing.
 */
class TestZobrist implements CurrentZobrist<[number, number]> {
  key: [number, number] = [0, 0];

  updateSquareOccupancy(
    color: number,
    pieceType: number,
    square: number,
  ): void {}
  updateCastlingState(castlingState: number): void {}
  updateEnPassantFile(file: number): void {}
  updateTurn(): void {}
  pushKey(): void {}
  popKey(): void {}
}

const ALL_ENTRY: TranspositionTableEntry = {
  nodeType: NodeType.All,
  inverseDepth: 5,
  score: 120,
  move: { from: 23, to: 24, promotion: PieceType.Null },
};
const PV_ENTRY: TranspositionTableEntry = {
  nodeType: NodeType.PV,
  inverseDepth: 12,
  score: 143243,
  move: { from: 0, to: 1, promotion: PieceType.Null },
};

test('set and get entry', () => {
  const ttable = new TTableArrayBuffer(8, new TestZobrist());

  ttable.currentKey.key = [0, 0];
  ttable.set(ALL_ENTRY);
  expect(ttable.get()).toEqual<TranspositionTableEntry>(ALL_ENTRY);

  ttable.currentKey.key = [1, 0];
  ttable.set(PV_ENTRY);
  expect(ttable.get()).toEqual<TranspositionTableEntry>(PV_ENTRY);

  ttable.currentKey.key = [3, 0];
  expect(ttable.get()).toEqual(undefined);

  ttable.currentKey.key = [0, 0];
  expect(ttable.get()).toEqual<TranspositionTableEntry>(ALL_ENTRY);

  expect(ttable.stats()).toEqual({
    hits: 3,
    miss: 1,
    type1: 0,
    size: 2,
    percentFull: 0.25,
  });
});

test('type1 collision', () => {
  const ttable = new TTableArrayBuffer(8, new TestZobrist());

  ttable.currentKey.key = [2, 0];
  ttable.set(ALL_ENTRY);
  expect(ttable.get()).toEqual<TranspositionTableEntry>(ALL_ENTRY);

  ttable.currentKey.key = [2, 999];
  expect(ttable.get()).toEqual(undefined);

  expect(ttable.stats()).toEqual({
    hits: 1,
    miss: 0,
    type1: 1,
    size: 1,
    percentFull: 0.125,
  });
});

test('hash key down to fit', () => {
  const ttable = new TTableArrayBuffer(64, new TestZobrist());

  ttable.currentKey.key = [2342, 1231];
  ttable.set(ALL_ENTRY);
  expect(ttable.get()).toEqual<TranspositionTableEntry>(ALL_ENTRY);

  // Go to a different key that should modulo to the same index
  ttable.currentKey.key = [2470, 999];
  ttable.set(PV_ENTRY);
  expect(ttable.get()).toEqual<TranspositionTableEntry>(PV_ENTRY);

  // Go to the first key which should have been overwritten so now the check
  // keys will not match
  ttable.currentKey.key = [2342, 1231];
  expect(ttable.get()).toEqual(undefined);

  expect(ttable.stats()).toEqual({
    hits: 2,
    miss: 0,
    type1: 1,
    size: 1,
    percentFull: 0.015625,
  });
});

test('final slot', () => {
  const ttable = new TTableArrayBuffer(32, new TestZobrist());

  ttable.currentKey.key = [31, 0];
  ttable.set(ALL_ENTRY);
  expect(ttable.get()).toEqual<TranspositionTableEntry>(ALL_ENTRY);
});
