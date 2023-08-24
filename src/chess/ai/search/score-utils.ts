import Engine from '../../engine';
import { EVALUATION_DIVIDER, MATE_SCORE } from '../../engine/evaluation';
import { Move } from '../../types';
import TranspositionTable from './transposition-table';
import { NodeType, TranspositionTableEntry } from './types';

export const humanEvaluation = (score: number, maxDepth: number): string => {
  let str: number | string = score;
  if (str >= MATE_SCORE) {
    str = `+M${(maxDepth - (str - MATE_SCORE) + 1) / 2}`;
  } else if (str <= -1 * MATE_SCORE) {
    str = `-M${(maxDepth - (str + MATE_SCORE)) / 2}`;
  } else {
    str /= EVALUATION_DIVIDER;
    str = str.toString();
  }

  return str;
};

export const extractPV = (
  table: TranspositionTable<TranspositionTableEntry>,
  engine: Engine,
): Move[] => {
  const pv: Move[] = [];
  let i = 0;

  // Probe the transposition table until we are no longer at a PV-node.
  for (; i < Infinity; i++) {
    const entry = table.get(engine.zobrist);
    if (entry?.nodeType === NodeType.PV && entry?.move) {
      pv.push(entry.move);
    } else {
      break;
    }

    engine.applyMove(entry.move);
  }
  for (; i > 0; i--) {
    engine.undoLastMove();
  }

  return pv;
};
