import Engine from '../engine';
import { MoveWithExtraData } from '../types';
import Diagnostics from './diagnostics';
import SearchState from './search-state';
import { ISearchContext, ISearchState, SearchConfiguration } from './types';

export const DEFAULT_CONFIGURATION: SearchConfiguration = {
  pruneNodes: false,
  quiescenceSearch: false,
  killerMoveHeuristic: false,
  historyMoveHeuristic: false,
  orderMoves: (moves: MoveWithExtraData[]) => moves,
};

export default class SearchContext implements ISearchContext {
  engine: Engine;
  diagnostics: Diagnostics;
  state: ISearchState;
  configuration = DEFAULT_CONFIGURATION;

  constructor(depth: number, engine: Engine, diagnostics: Diagnostics) {
    this.engine = engine;
    this.diagnostics = diagnostics;
    this.state = new SearchState(depth);
  }
}
