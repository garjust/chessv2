import { Move, Position } from '../types';
import { Version, Registry } from './registry';
import { DiagnosticsResult } from './lib/diagnostics';

export interface SearchExecutorI {
  nextMove(position: Position, timeout?: number): Promise<Move>;
  get diagnosticsResult(): DiagnosticsResult | null;
  get label(): string;
}

export class SearchExecutor implements SearchExecutorI {
  searchExecutor: InstanceType<(typeof Registry)[Version]>;

  constructor(version: Version, maxDepth: number) {
    this.searchExecutor = new Registry[version](maxDepth);
  }

  nextMove(position: Position, timeout?: number | undefined): Promise<Move> {
    return this.searchExecutor.nextMove(position, timeout);
  }

  get diagnosticsResult(): DiagnosticsResult | null {
    return this.searchExecutor.diagnosticsResult;
  }

  get label(): string {
    return this.searchExecutor.label;
  }
}
