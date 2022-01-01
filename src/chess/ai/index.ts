import { Position } from '../types';
import { AvailableComputerVersions, ChessComputerConstructor } from './types';
import v3 from './v3';
import v4 from './v4';
import v5 from './v5';
import v6 from './v6';

export const ComputerRegistry: Record<
  AvailableComputerVersions,
  ChessComputerConstructor<Position>
> = Object.freeze({
  v3: v3,
  v4: v4,
  v5: v5,
  v6: v6,
});
