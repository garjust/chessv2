import { Position } from '../../types';
import { Engine } from '../types';
import { evaluate } from './evaluation';
import { applyMove } from './move-execution';
import { computeMovementData } from './move-generation';

const engine: Engine<Position> = {
  applyMove,
  evaluate,
  generateMoves: (position: Position) => computeMovementData(position).moves,
};

export default engine;
