import { formatNumber } from '../../../lib/formatter';
import { Move } from '../../types';
import { moveString } from '../../utils';
import State from './state';
import { TreeDiagnostics } from './tree-diagnostics';
import { SearchResult } from './types';

type PlyCounter = {
  nodes: number;
  cuts: number;
};

type MoveScores = { move: string; score: number }[];

type StateData = Pick<
  State,
  'historyTable' | 'killerMoves' | 'pvTable' | 'tTable'
>;

export type DiagnosticsResult = {
  label: string;
  logString: string;
  logStringLight: string;
  move: string;
  moveScores: MoveScores;
  totalNodes: number;
  totalCuts: number;
  plyCounters: Record<number, PlyCounter>;
  depth: number;
  timing: number;
  state?: StateData;
  principleVariation?: string[];
};

export default class Diagnotics {
  label: string;
  maxDepth: number;
  enableTreeDiagnostics;
  plyCounters: Record<number, PlyCounter> = {};
  result?: DiagnosticsResult;
  treeDiagnostics?: TreeDiagnostics;
  start: number;

  constructor(label: string, maxDepth: number, enableTreeDiagnostics = false) {
    this.label = label;
    this.maxDepth = maxDepth;
    this.enableTreeDiagnostics = enableTreeDiagnostics;
    this.start = Date.now();

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

  recordResult(result: SearchResult, state?: State) {
    const { move, scores, pv } = result;

    const timing = Date.now() - this.start;
    const totalNodes = Object.values(this.plyCounters).reduce(
      (sum, plyCounter) => sum + plyCounter.nodes,
      0
    );
    const totalCuts = Object.values(this.plyCounters).reduce(
      (sum, plyCounter) => sum + plyCounter.cuts,
      0
    );

    const stateData: StateData | undefined = state
      ? {
          historyTable: state.historyTable,
          killerMoves: state.killerMoves,
          pvTable: state.pvTable,
          tTable: state.tTable,
        }
      : undefined;

    const diagnosticsResults: DiagnosticsResult = {
      label: this.label,
      logString: `${this.label} ${moveString(move)}: depth=${
        this.maxDepth
      }; timing=${formatNumber(timing)}ms; nodes=${formatNumber(
        totalNodes
      )}; (${((timing / totalNodes) * 1000).toPrecision(
        5
      )}μs/node); cuts=${formatNumber(totalCuts)}`,
      logStringLight: `depth=${this.maxDepth}; timing=${formatNumber(
        timing
      )}ms; nodes=${formatNumber(totalNodes)}`,
      move: moveString(move),
      moveScores: scores.map(({ move, score }) => ({
        move: moveString(move),
        score,
      })),
      totalNodes,
      totalCuts,
      plyCounters: this.plyCounters,
      depth: this.maxDepth,
      timing,
      state: stateData,
      principleVariation: pv.map((move) => moveString(move)),
    };

    this.result = diagnosticsResults;
  }
}
