import Core from '../../core';
import { EVALUATION_DIVIDER, MATE_SCORE } from '../../core/evaluation';
import { Move } from '../../types';
import {
  NodeType,
  TranspositionTable,
  TranspositionTableEntry,
} from '../types';

export const uciInfoEvaluation = (score: number, maxDepth: number): string => {
  let str: string;
  if (score >= MATE_SCORE) {
    str = `mate ${(maxDepth - (score - MATE_SCORE) + 1) / 2}`;
  } else if (score <= -1 * MATE_SCORE) {
    str = `mate -${(maxDepth - (score + MATE_SCORE)) / 2}`;
  } else {
    str = `cp ${score / EVALUATION_DIVIDER}`;
  }

  return str;
};

export const extractPV = (
  table: TranspositionTable<TranspositionTableEntry>,
  core: Core,
  maxPlies: number,
): Move[] => {
  const pv: Move[] = [];
  let i = 0;

  // Probe the transposition table until we are no longer at a PV-node.
  for (; i < maxPlies; i++) {
    const entry = table.get();
    if (entry?.nodeType === NodeType.PV && entry?.move) {
      pv.push(entry.move);
    } else {
      break;
    }

    core.applyMove(entry.move);
  }
  for (; i > 0; i--) {
    core.undoLastMove();
  }

  return pv;
};
