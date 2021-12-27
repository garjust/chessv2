import { Position } from '../types';
import { AvailableComputerVersions, ChessComputerConstructor } from './types';
import v1 from './v1';
import v2 from './v2';
import v3 from './v3';
import v4 from './v3';

export const ComputerRegistry: Record<
  AvailableComputerVersions,
  ChessComputerConstructor<Position>
> = Object.freeze({
  v1: v1,
  v2: v2,
  v3: v3,
  v4: v4,
});
