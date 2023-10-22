import { Color, Pin, Position as ExternalPosition, Square } from '../types';
import AttackMap from './attack-map';
import Pins from './pins';

// Use two 32bit numbers for the zobrist key maintained by the engine.
export type ZobristKey = [number, number];

export type KingSquares = {
  [Color.White]?: Square;
  [Color.Black]?: Square;
};

export type PinsByColor = {
  [Color.White]: Pins;
  [Color.Black]: Pins;
};

export type AttackedSquares = {
  [Color.White]: AttackMap;
  [Color.Black]: AttackMap;
};

export type Position = ExternalPosition & {
  kings: KingSquares;
  absolutePins: PinsByColor;
  attackedSquares: AttackedSquares;
};
