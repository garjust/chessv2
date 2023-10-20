import { Registry, Version } from './registry';
import Core from '../core';
import init, {
  Action,
  State,
  createState,
  loadSearchExecutorAction,
} from './workflow';
import { SearchExecutorI } from './search-executor';
import { UCIResponse } from './workflow/uci-response';
import { Workflow, updateLogger } from '../../lib/workflow';

// Class representing a chess engine which communicates via the UCI protocol.
//
// This class does not handle UCI messages directly, instead processing UCI
// workflow actions.
export class Engine {
  private searchExecutor: SearchExecutorI;
  private workflow: Workflow<State, Action>;

  constructor(
    version: Version,
    maxDepth: number,
    responseFunc: (response: UCIResponse) => void,
  ) {
    this.searchExecutor = new Registry[version](maxDepth);
    this.workflow = init(createState(), {
      engine: new Core(),
      executor: this.searchExecutor,
      sendUCIResponse: responseFunc,
    });

    this.workflow.updates.subscribe(updateLogger('Engine'));

    this.workflow.emit(loadSearchExecutorAction(version, maxDepth));
  }

  emit(action: Action) {
    this.workflow.emit(action);
  }

  get diagnosticsResult() {
    return this.searchExecutor.diagnosticsResult;
  }

  get label() {
    return this.searchExecutor.label;
  }
}
