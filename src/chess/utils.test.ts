import { expect, test } from 'vitest';
import { DirectionUnit } from './types';
import {
  directionOfMove,
  fileIndexForSquare,
  flipDirection,
  rankIndexForSquare,
} from './utils';

test('directionOfMove', () => {
  expect(directionOfMove(35, 34)).toEqual(DirectionUnit.Left);
  expect(directionOfMove(35, 43)).toEqual(DirectionUnit.Up);
  expect(directionOfMove(35, 36)).toEqual(DirectionUnit.Right);
  expect(directionOfMove(35, 27)).toEqual(DirectionUnit.Down);
  expect(directionOfMove(35, 42)).toEqual(DirectionUnit.UpLeft);
  expect(directionOfMove(35, 44)).toEqual(DirectionUnit.UpRight);
  expect(directionOfMove(35, 26)).toEqual(DirectionUnit.DownLeft);
  expect(directionOfMove(35, 28)).toEqual(DirectionUnit.DownRight);

  expect(directionOfMove(28, 26)).toEqual(DirectionUnit.Left);
  expect(directionOfMove(28, 44)).toEqual(DirectionUnit.Up);
  expect(directionOfMove(28, 30)).toEqual(DirectionUnit.Right);
  expect(directionOfMove(28, 12)).toEqual(DirectionUnit.Down);
  expect(directionOfMove(28, 42)).toEqual(DirectionUnit.UpLeft);
  expect(directionOfMove(28, 46)).toEqual(DirectionUnit.UpRight);
  expect(directionOfMove(28, 10)).toEqual(DirectionUnit.DownLeft);
  expect(directionOfMove(28, 14)).toEqual(DirectionUnit.DownRight);

  expect(directionOfMove(0, 56)).toEqual(DirectionUnit.Up);
  expect(directionOfMove(0, 63)).toEqual(DirectionUnit.UpRight);
  expect(directionOfMove(9, 63)).toEqual(DirectionUnit.UpRight);
  expect(directionOfMove(0, 7)).toEqual(DirectionUnit.Right);

  expect(directionOfMove(63, 7)).toEqual(DirectionUnit.Down);
  expect(directionOfMove(63, 0)).toEqual(DirectionUnit.DownLeft);
  expect(directionOfMove(63, 56)).toEqual(DirectionUnit.Left);

  expect(directionOfMove(4, 60)).toEqual(DirectionUnit.Up);
  expect(directionOfMove(56, 7)).toEqual(DirectionUnit.DownRight);
  expect(directionOfMove(56, 0)).toEqual(DirectionUnit.Down);
});

test('flipDirection', () => {
  expect(flipDirection(DirectionUnit.Up)).toEqual(DirectionUnit.Down);
  expect(flipDirection(DirectionUnit.Down)).toEqual(DirectionUnit.Up);
  expect(flipDirection(DirectionUnit.Left)).toEqual(DirectionUnit.Right);
  expect(flipDirection(DirectionUnit.Right)).toEqual(DirectionUnit.Left);
  expect(flipDirection(DirectionUnit.UpLeft)).toEqual(DirectionUnit.DownRight);
  expect(flipDirection(DirectionUnit.UpRight)).toEqual(DirectionUnit.DownLeft);
  expect(flipDirection(DirectionUnit.DownLeft)).toEqual(DirectionUnit.UpRight);
  expect(flipDirection(DirectionUnit.DownRight)).toEqual(DirectionUnit.UpLeft);
});

test('convert square into rank and file numbers', () => {
  [
    [0, 0, 0],
    [1, 0, 1],
    [2, 0, 2],
    [3, 0, 3],
    [4, 0, 4],
    [5, 0, 5],
    [6, 0, 6],
    [7, 0, 7],
    [8, 1, 0],
    [9, 1, 1],
    [10, 1, 2],
    [11, 1, 3],
    [12, 1, 4],
    [13, 1, 5],
    [14, 1, 6],
    [15, 1, 7],
    [16, 2, 0],
    [17, 2, 1],
    [18, 2, 2],
    [19, 2, 3],
    [20, 2, 4],
    [21, 2, 5],
    [22, 2, 6],
    [23, 2, 7],
    [24, 3, 0],
    [25, 3, 1],
    [26, 3, 2],
    [27, 3, 3],
    [28, 3, 4],
    [29, 3, 5],
    [30, 3, 6],
    [31, 3, 7],
    [32, 4, 0],
    [33, 4, 1],
    [34, 4, 2],
    [35, 4, 3],
    [36, 4, 4],
    [37, 4, 5],
    [38, 4, 6],
    [39, 4, 7],
    [40, 5, 0],
    [41, 5, 1],
    [42, 5, 2],
    [43, 5, 3],
    [44, 5, 4],
    [45, 5, 5],
    [46, 5, 6],
    [47, 5, 7],
    [48, 6, 0],
    [49, 6, 1],
    [50, 6, 2],
    [51, 6, 3],
    [52, 6, 4],
    [53, 6, 5],
    [54, 6, 6],
    [55, 6, 7],
    [56, 7, 0],
    [57, 7, 1],
    [58, 7, 2],
    [59, 7, 3],
    [60, 7, 4],
    [61, 7, 5],
    [62, 7, 6],
    [63, 7, 7],
  ].forEach(([square, rank, file]) => {
    expect(rankIndexForSquare(square)).toEqual(rank);
    expect(fileIndexForSquare(square)).toEqual(file);
  });
});
