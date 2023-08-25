import { DirectionUnit } from './types';
import { directionOfMove } from './utils';

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
