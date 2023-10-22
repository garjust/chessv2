import { Registry, Version } from './registry';
import Core from '../core';
import init, {
  Action,
  State,
  createState,
  loadSearchExecutorAction,
} from './workflow';
import { InternalType, RespondAction } from './workflow/action';
import { SearchExecutorI } from './search-executor';
import { UCIResponse } from './workflow/uci-response';
import { Workflow, updateLogger } from '../../lib/workflow';
import { Observable, filter, map } from 'rxjs';
import { immutableStateWatcher } from '../../lib/workflow/logger';

const isRespondAction = (action: Action): action is RespondAction =>
  action.type === InternalType.Respond;

// Class representing a chess engine which communicates via the UCI protocol.
//
// This class does not handle UCI messages directly, instead processing UCI
// workflow actions.
export class Engine {
  private searchExecutor: SearchExecutorI;
  private workflow: Workflow<State, Action>;

  constructor(version: Version, maxDepth: number) {
    this.searchExecutor = new Registry[version](maxDepth);
    this.workflow = init(createState(), {
      engine: new Core(),
      executor: this.searchExecutor,
    });

    this.workflow.updates.subscribe(updateLogger('Engine'));
    // this.workflow.states.subscribe(immutableStateWatcher());

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

  // Return an observable of UCIResponse objects.
  //
  // Extra note:
  // If there is a problem with timing of subscribing to the observable returned
  // here a ReplaySubject can be used:
  //
  // const responses = new ReplaySubject<UCIResponse>();
  // this.workflow.updates
  //   .pipe(
  //     map(([_, action]) => action),
  //     filter(isRespondAction),
  //     map((action) => action.response),
  //   )
  //   .subscribe((response) => {
  //     responses.next(response);
  //   });
  // this.responses = responses.asObservable();
  get responses(): Observable<UCIResponse> {
    return this.workflow.updates.pipe(
      map(([_, action]) => action),
      filter(isRespondAction),
      map((action) => action.response),
    );
  }
}
