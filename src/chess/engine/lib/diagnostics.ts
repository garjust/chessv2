import { formatNumber } from '../../../lib/formatter';
import { moveString } from '../../move-notation';
import { uciInfoEvaluation } from './score-utils';
import State from './state';
import SearchTree from './tree-diagnostics';
import { NodeType, SearchResult } from '../types';

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
  plyCounters: PlyCounter[] = [];
  searchTree?: SearchTree;

  private readonly maxDepth: number;
  private readonly enableTreeDiagnostics;
  private readonly start: number;

  constructor(maxDepth: number, enableTreeDiagnostics = false) {
    this.maxDepth = maxDepth;
    this.enableTreeDiagnostics = enableTreeDiagnostics;
    this.start = Date.now();

    for (let i = 0; i <= maxDepth; i++) {
      this.plyCounters[i] = emptyPlyCounter();
    }

    if (this.enableTreeDiagnostics) {
      this.searchTree = new SearchTree();
    }
  }

  nodeVisit(inverseDepth: number) {
    this.plyCounters[inverseDepth].nodes++;
  }

  nodeType(inverseDepth: number, type: NodeType) {
    this.plyCounters[inverseDepth].nodeType[type]++;
  }

  cut(inverseDepth: number) {
    this.plyCounters[inverseDepth].cuts++;
  }

  cutFromTable(inverseDepth: number) {
    this.plyCounters[inverseDepth].tableCuts++;
    this.cut(inverseDepth);
  }

  quiescenceNodeVisit() {
    this.plyCounters[this.maxDepth].nodes++;
  }

  quiescenceCut() {
    this.plyCounters[this.maxDepth].cuts++;
  }

  recordResult(result: SearchResult, state?: State): DiagnosticsResult {
    const { move, scores, pv } = result;

    const timing = Date.now() - this.start;
    const totalNodes = Object.values(this.plyCounters).reduce(
      (sum, plyCounter) => sum + plyCounter.nodes,
      0,
    );
    const totalCuts = Object.values(this.plyCounters).reduce(
      (sum, plyCounter) => sum + plyCounter.cuts,
      0,
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
      move: moveString(move),
      evaluation: uciInfoEvaluation(result.bestScore.score, this.maxDepth),
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

    return diagnosticsResults;
  }

  ttableLog(state: State): string {
    const stats = state.tTable.stats();
    return `ttable: size=${formatNumber(stats.size)}(${(
      stats.percentFull * 100
    ).toFixed(2)}%) hits=${formatNumber(stats.hits)} miss=${formatNumber(
      stats.miss,
    )} type1=${formatNumber(stats.type1)} cachehit=${(
      (stats.hits / (stats.hits + stats.miss + stats.type1)) *
      100
    ).toFixed(2)}%`;
  }
}
