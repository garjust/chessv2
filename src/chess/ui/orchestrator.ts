import { interval, map } from 'rxjs';
import { Workflow, updateLogger } from '../../lib/workflow';
import Core from '../core';
import { FEN_LIBRARY } from '../lib/fen';
import init, {
  Action,
  State,
  createState,
  setPositionFromFENAction,
  tickPlayersClockAction,
} from './workflow';
import { Type } from './workflow/action';

const FEN_FOR_INITIAL_POSITION = FEN_LIBRARY.STARTING_POSITION_FEN;

export class Orchestrator {
  workflow: Workflow<State, Action>;

  constructor() {
    this.workflow = init(createState(), {
      core: new Core(),
    });

    this.workflow.updates.subscribe(
      updateLogger('Chess', [Type.TickPlayersClock]),
    );
    const ticker = interval(100).pipe(map(() => tickPlayersClockAction()));
    ticker.subscribe(this.workflow.emit);
    this.workflow.emit(setPositionFromFENAction(FEN_FOR_INITIAL_POSITION));
  }
}
