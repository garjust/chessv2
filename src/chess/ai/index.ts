import { Position } from '../types';
import { AvailableComputerVersions, ChessComputerConstructor } from './types';
import { default as v1 } from './v1';
import { default as v2 } from './v2';
import { default as v3 } from './v3';

export const ComputerRegistry: Record<
  AvailableComputerVersions,
  ChessComputerConstructor<Position>
> = Object.freeze({
  v1: v1,
  v2: v2,
  v3: v3,
});
