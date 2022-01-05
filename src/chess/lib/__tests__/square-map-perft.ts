import { parseFEN, VIENNA_OPENING_FEN } from '../fen';
import { SquareMap } from '../square-map';
import { SquareMapWithList } from '../square-map-with-list';
import { Square } from '../../types';

const N = 10_000;

const setupMap = <T>(map: Map<Square, number>) => {
  const position = parseFEN(VIENNA_OPENING_FEN);
  for (const [square] of position.pieces) {
    map.set(square, 1);
  }
};

test('SquareMap entries', () => {
  const map = new SquareMap<number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    for (const _ of map) {
      counter++;
    }
  }
  const time = Date.now() - now;
  console.log(`SquareMap entries timing=${time}ms`);

  expect(counter).toEqual(N * 32);
});

test('SquareMap for-in', () => {
  const map = new SquareMap<number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    for (const square in map.map) {
      counter += Number(square);
    }
  }
  const time = Date.now() - now;
  console.log(`SquareMap for-in timing=${time}ms`);

  expect(counter).toEqual(1029 * N);
});

test('SquareMap inner list entries', () => {
  const map = new SquareMap<number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    for (const _ of map.map) {
      counter++;
    }
  }
  const time = Date.now() - now;
  console.log(`SquareMap inner list entries timing=${time}ms`);

  expect(counter).toEqual(N * 64);
});

test('SquareMapWithList entries', () => {
  const map = new SquareMapWithList<number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    for (const _ of map) {
      counter++;
    }
  }
  const time = Date.now() - now;
  console.log(`SquareMapWithList entries timing=${time}ms`);

  expect(counter).toEqual(N * 32);
});

test('SquareMapWithList inner list entries', () => {
  const map = new SquareMapWithList<number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    for (const _ of map.list) {
      counter++;
    }
  }
  const time = Date.now() - now;
  console.log(`SquareMapWithList inner list entries timing=${time}ms`);

  expect(counter).toEqual(N * 32);
});

test('Map entries', () => {
  const map = new Map<Square, number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    for (const _ of map) {
      counter++;
    }
  }
  const time = Date.now() - now;
  console.log(`Map entries timing=${time}ms`);

  expect(counter).toEqual(N * 32);
});

test('SquareMap set', () => {
  const map = new SquareMap<number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    map.set(i % 2 == 0 ? 7 : 3, i % 3 == 0 ? 2 : 34);
    counter++;
  }
  const time = Date.now() - now;
  console.log(`SquareMap set timing=${time}ms`);

  expect(counter).toEqual(N);
});

test('SquareMapWithList set', () => {
  const map = new SquareMapWithList<number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    map.set(i % 2 == 0 ? 7 : 3, i % 3 == 0 ? 2 : 34);
    counter++;
  }
  const time = Date.now() - now;
  console.log(`SquareMapWithList set timing=${time}ms`);

  expect(counter).toEqual(N);
});

test('Map set', () => {
  const map = new Map<Square, number>();
  setupMap(map);

  const now = Date.now();
  let counter = 0;
  for (let i = 0; i < N; i++) {
    map.set(i % 2 == 0 ? 7 : 3, i % 3 == 0 ? 2 : 34);
    counter++;
  }
  const time = Date.now() - now;
  console.log(`Map set timing=${time}ms`);

  expect(counter).toEqual(N);
});
