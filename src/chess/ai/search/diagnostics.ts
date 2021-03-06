import { formatNumber } from '../../../lib/formatter';
import { moveString } from '../../utils';
import { humanEvaluation } from './score-utils';
import State from './state';
import SearchTree from './tree-diagnostics';
import { NodeType, SearchResult } from './types';

type PlyCounter = {
  nodes: number;
  cuts: number;
  tableCuts: number;
  nodeType: {
    [NodeType.PV]: number;
    [NodeType.Cut]: number;
    [NodeType.All]: number;
  };
};

type MoveScores = { move: string; score: number }[];

type StateData = Pick<
  State,
  'historyTable' | 'killerMoves' | 'pvTable' | 'tTable'
>;

const emptyPlyCounter = (): PlyCounter => ({
  nodes: 0,
  cuts: 0,
  tableCuts: 0,
  nodeType: {
    [NodeType.PV]: 0,
    [NodeType.Cut]: 0,
    [NodeType.All]: 0,
  },
});

export type DiagnosticsResult = {
  label: string;
  logString: string;
  logStringLight: string;
  move: string;
  evaluation: string;
  moveScores: MoveScores;
  totalNodes: number;
  totalCuts: number;
  plyCounters: Record<number, PlyCounter>;
  depth: number;
  timing: number;
  state?: StateData;
  principleVariation?: string[];
  searchTree?: SearchTree;
};

export default class Diagnotics {
  label: string;
  maxDepth: number;
  enableTreeDiagnostics;
  plyCounters: Record<number, PlyCounter> = {};
  result?: DiagnosticsResult;
  searchTree?: SearchTree;
  start: number;

  constructor(label: string, maxDepth: number, enableTreeDiagnostics = false) {
    this.label = label;
    this.maxDepth = maxDepth;
    this.enableTreeDiagnostics = enableTreeDiagnostics;
    this.start = Date.now();

    this.plyCounters[-1] = emptyPlyCounter();
    for (let i = 1; i <= maxDepth; i++) {
      this.plyCounters[i] = emptyPlyCounter();
    }

    if (this.enableTreeDiagnostics) {
      this.searchTree = new SearchTree();
    }
  }

  nodeVisit(depth: number) {
    this.plyCounters[this.maxDepth - depth].nodes++;
  }

  nodeType(depth: number, type: NodeType) {
    this.plyCounters[this.maxDepth - depth].nodeType[type]++;
  }

  cut(depth: number) {
    this.plyCounters[this.maxDepth - depth].cuts++;
  }

  cutFromTable(depth: number) {
    this.plyCounters[this.maxDepth - depth].tableCuts++;
    this.cut(depth);
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
      )}??s/node); cuts=${formatNumber(totalCuts)}`,
      logStringLight: `depth=${this.maxDepth}; timing=${formatNumber(
        timing
      )}ms; nodes=${formatNumber(totalNodes)}`,
      move: moveString(move),
      evaluation: humanEvaluation(result.bestScore.score, this.maxDepth),
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
