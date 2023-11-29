import { Color, ColorData, Position, Square } from '../types';
import SquareControlMap from './square-control-map';
import Pins from './pins';

// Use two 32bit numbers for the zobrist key maintained by the engine.
export type ZobristKey = [number, number];

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
