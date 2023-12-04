import { Color, ColorData, Position, Square } from '../types';
import SquareControlMap from './square-control-map';
import Pins from './pins';

export type KingSquares = {
  [Color.White]?: Square;
  [Color.Black]?: Square;
};

export type PinsByColor = ColorData<Pins>;

export type SquareControlByColor = ColorData<SquareControlMap>;

export type PositionWithComputedData = Position &
  Readonly<{
    kings: KingSquares;
    absolutePins: PinsByColor;
    squareControlByColor: SquareControlByColor;
  }>;
