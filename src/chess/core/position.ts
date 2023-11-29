import { Color, Position } from '../types';
import { copyPosition, findKing } from '../utils';
import SquareControlMap from './square-control-map';
import Pins from './pins';
import { KingSquares, PositionWithComputedData } from './types';

const computeExtraPositionData = (
  position: Position,
): PositionWithComputedData => {
  const whiteKing = findKing(position, Color.White);
  const blackKing = findKing(position, Color.Black);

  const kings: KingSquares = {
    [Color.White]: whiteKing,
    [Color.Black]: blackKing,
  };

  const squareControlByColor = {
    [Color.White]: new SquareControlMap(position, Color.White),
    [Color.Black]: new SquareControlMap(position, Color.Black),
  };

  const absolutePins = {
    [Color.White]: new Pins(position.pieces, whiteKing, Color.White),
    [Color.Black]: new Pins(position.pieces, blackKing, Color.Black),
  };

  return {
    ...position,
    kings,
    absolutePins,
    squareControlByColor,
  };
};

/**
 * WARNING: This function is very slow and should not be used during game
 * tree traversal.
 *
 * This function initializes all the state used to make the core run as fast
 * as possible.
 */
export const copyToInternal = (position: Position): PositionWithComputedData =>
  computeExtraPositionData(copyPosition(position));

export const copyToExternal = (position: Position): Position =>
  copyPosition(position);
