import { interval, map } from 'rxjs';
import { Workflow, updateLogger } from '../../lib/workflow';
import Core from '../core';
import init, {
  Action,
  State,
  createState,
  tickPlayersClockAction,
} from './workflow';
import { Type } from './workflow/action';

export class Orchestrator {
  workflow: Workflow<State, Action>;

  constructor(debug = false) {
    this.workflow = init(createState(), {
      core: new Core(),
    });
    if (debug) {
      this.workflow.updates.subscribe(
        updateLogger('Chess', [Type.TickPlayersClock]),
      );
    }

    const ticker = interval(100).pipe(map(() => tickPlayersClockAction()));
    ticker.subscribe(this.workflow.emit);
  }
}
