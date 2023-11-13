import { Version } from './search-executor';
import Core from '../core';
import init, { Action, State, createState } from './workflow';
import { Public, Type } from './workflow/action';
import { UCIResponse } from './workflow/uci-response';
import { Workflow, updateLogger } from '../../rx-workflow';
import { Observable, filter, map } from 'rxjs';

const isRespondAction = (
  action: Action,
): action is Action & { type: Type.Respond } => action.type === Type.Respond;

// Class representing a chess engine which communicates via the UCI protocol.
//
// This class does not handle UCI messages directly, instead processing UCI
// workflow actions.
export class Engine {
  workflow: Workflow<State, Action, Public>;

  constructor(version: Version, debug = false) {
    this.workflow = init(
      createState({
        config: {
          version,
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
