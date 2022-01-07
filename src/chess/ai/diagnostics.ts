import { formatNumber } from '../../lib/formatter';
import { Move } from '../types';
import { moveString } from '../utils';
import { TreeDiagnostics } from './tree-diagnostics';

type PlyCounter = {
  nodes: number;
  cuts: number;
};

type MoveScores = { move: string; score: number }[];

export default class Diagnotics {
  label: string;
  maxDepth: number;
  enableTreeDiagnostics;
  plyCounters: Record<number, PlyCounter> = {};
  result?: {
    move: string;
    moveScores: MoveScores;
    totalNodes: number;
    totalCuts: number;
    plyCounters: Record<number, PlyCounter>;
    depth: number;
  };
  treeDiagnostics?: TreeDiagnostics;

  constructor(label: string, maxDepth: number, enableTreeDiagnostics = false) {
    this.label = label;
    this.maxDepth = maxDepth;
    this.enableTreeDiagnostics = enableTreeDiagnostics;

    this.plyCounters[-1] = { nodes: 0, cuts: 0 };
    for (let i = 1; i <= maxDepth; i++) {
      this.plyCounters[i] = { nodes: 0, cuts: 0 };
    }

    if (this.treeDiagnostics) {
      this.treeDiagnostics = new TreeDiagnostics(this.label);
    }
  }

  nodeVisit(depth: number) {
    this.plyCounters[this.maxDepth - depth].nodes++;
  }

  cut(depth: number) {
    this.plyCounters[this.maxDepth - depth].cuts++;
  }

  quiescenceNodeVisit() {
    this.plyCounters[-1].nodes++;
  }

  quiescenceCut() {
    this.plyCounters[-1].cuts++;
  }

  recordResult(move: Move, moveScores: { move: Move; score: number }[]) {
    this.result = {
      move: moveString(move),
      moveScores: moveScores.map(({ move, score }) => ({
        move: moveString(move),
        score,
      })),
      totalNodes: Object.values(this.plyCounters).reduce(
        (sum, plyCounter) => sum + plyCounter.nodes,
        0
      ),
      totalCuts: Object.values(this.plyCounters).reduce(
        (sum, plyCounter) => sum + plyCounter.cuts,
        0
      ),
      plyCounters: this.plyCounters,
      depth: this.maxDepth,
    };
  }

  toString() {
    if (!this.result) {
      throw Error('no result recorded yet');
    }

    return `${this.label} results: nodes=${formatNumber(
      this.result.totalNodes
    )}; depth=${this.maxDepth}`;
  }
}
