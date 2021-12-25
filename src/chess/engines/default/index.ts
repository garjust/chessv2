import { Position } from '../../types';
import { flattenMoves } from '../../utils';
import { Engine } from '../types';
import { evaluate } from './evaluation';
import { applyMove } from './move-execution';
import { computeMovementData } from './move-generation';

const engine: Engine<Position> = {
  applyMove,
  evaluate,
  generateMoves: (position: Position) =>
    flattenMoves(computeMovementData(position).movesByPiece),
};

export default engine;
