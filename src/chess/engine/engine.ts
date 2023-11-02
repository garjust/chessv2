import { Version } from './search-executor';
import Core from '../core';
import init, { Action, State, createState } from './workflow';
import { InternalType, RespondAction } from './workflow/action';
import { UCIResponse } from './workflow/uci-response';
import { Workflow, updateLogger } from '../../lib/workflow';
import { Observable, filter, map } from 'rxjs';

const isRespondAction = (action: Action): action is RespondAction =>
  action.type === InternalType.Respond;

// Class representing a chess engine which communicates via the UCI protocol.
//
// This class does not handle UCI messages directly, instead processing UCI
// workflow actions.
export class Engine {
  workflow: Workflow<State, Action>;

  constructor(version: Version, maxDepth: number, debug = false) {
    this.workflow = init(
      createState({
        config: {
          version,
          maxDepth,
        },
      }),
      {
        core: new Core(),
      },
    );
    if (debug) {
      this.workflow.updates$.subscribe(updateLogger('Engine'));
    }
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
    return this.workflow.updates$.pipe(
      map(([_, action]) => action),
      filter(isRespondAction),
      map((action) => action.response),
    );
  }
}
