import { SquareBitmask, ZERO } from '../../lib/bitboard-def';
import { Move } from '../../types';
import {
  QUEEN_RAYS_FLAT,
  QUEEN_RAY_BITARRAYS,
  KING_RAY_BITBOARDS_FLAT,
} from '../move-lookup';

const N = 10_000_000;
const KING = 4;
const MOVE_HIT: Move = { from: 21, to: 32 };
const MOVE_MISS: Move = { from: 21, to: 30 };

test('perft of king ray lookup hit', () => {
  const move = MOVE_HIT;
  expect(testFn(bitboard, 'bitboard', move)).toEqual(N);
  expect(testFn(arrayIncludes, 'array_in', move)).toEqual(N);
  expect(testFn(arraySome, 'arr_some', move)).toEqual(N);
  expect(testFn(arrayLookup, 'arr_look', move)).toEqual(N);
});

test('perft of king ray lookup miss', () => {
  const move = MOVE_MISS;
  expect(testFn(bitboard, 'bitboard', move)).toEqual(0);
  expect(testFn(arrayIncludes, 'array_in', move)).toEqual(0);
  expect(testFn(arraySome, 'arr_some', move)).toEqual(0);
  expect(testFn(arrayLookup, 'arr_look', move)).toEqual(0);
});

function testFn(fn: (move: Move) => number, name: string, move: Move): number {
  const now = Date.now();
  const counter = fn(move);
  const time = Date.now() - now;
  console.log(
    `${name}: ${time}ms; ${((time / N) * 1000 * 1000).toPrecision(
      5
    )}ns/op     //check=${counter}`
  );
  return counter;
}

function bitboard(move: Move) {
  let counter = 0;
  for (let i = 0; i < N; i++) {
    (KING_RAY_BITBOARDS_FLAT[KING] &
      (SquareBitmask[move.from] | SquareBitmask[move.to])) !==
    ZERO
      ? counter++
      : counter;
  }
  return counter;
}

function arrayIncludes(move: Move) {
  let counter = 0;
  for (let i = 0; i < N; i++) {
    QUEEN_RAYS_FLAT[KING].includes(move.from) ||
    QUEEN_RAYS_FLAT[KING].includes(move.to)
      ? counter++
      : counter;
  }
  return counter;
}

function arraySome(move: Move) {
  let counter = 0;
  for (let i = 0; i < N; i++) {
    QUEEN_RAYS_FLAT[KING].some((x) => x === move.from || x === move.to)
      ? counter++
      : counter;
  }
  return counter;
}

function arrayLookup(move: Move) {
  let counter = 0;
  for (let i = 0; i < N; i++) {
    QUEEN_RAY_BITARRAYS[KING][move.from] || QUEEN_RAY_BITARRAYS[KING][move.to]
      ? counter++
      : counter;
  }
  return counter;
}
