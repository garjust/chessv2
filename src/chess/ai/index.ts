import { AvailableComputerVersions, ChessComputerConstructor } from './types';
import v2 from './v2';
import v3 from './v3';
import v4 from './v4';
import v5 from './v5';
import v6 from './v6';
import v7 from './v7';

export const LATEST = 'v7';

export const ComputerRegistry: Record<
  AvailableComputerVersions,
  ChessComputerConstructor
> = Object.freeze({
  v7: v7,
  v6: v6,
  v5: v5,
  v4: v4,
  v3: v3,
  v2: v2,
});
