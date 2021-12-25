import { ComputedPositionData, Position } from '../types';
import { evaluate } from './evaluation';
import { computeMovementData } from './move-generation';

export const computeAll = (position: Position): ComputedPositionData => {
  return {
    ...computeMovementData(position),
    evaluation: evaluate(position),
  };
};
