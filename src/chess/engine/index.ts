import { ComputedMovementData, Engine, Position } from '../types';
import { evaluate } from './evaluation';
import { applyMove } from './move-execution';
import { generateMovementData } from './move-generation';

const engine: Engine<Position> & {
  generateMovementData: (position: Position) => ComputedMovementData;
} = {
  applyMove,
  evaluate,
  generateMoves: (position: Position) => generateMovementData(position).moves,
  generateMovementData,
};

export default engine;
