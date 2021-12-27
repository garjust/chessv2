import { Engine } from '../types';
import { evaluate } from './evaluation';
import { applyMove } from './move-execution';
import { generateMoves } from './move-generation';
import { MutablePosition } from './types';

const engine: Engine<MutablePosition> = {
  applyMove,
  evaluate,
  generateMoves: (position: MutablePosition) => generateMoves(position),
};

export default engine;
