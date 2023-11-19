import { expect, test } from 'vitest';
import { Orchestrator } from './orchestrator';
import { Action, setPositionFromFENAction } from './workflow';
import { Type, clickSquareAction, loadEngineAction } from './workflow/action';
import { Action as EngineAction } from '../engine/workflow';
import { Type as EngineType } from '../engine/workflow/action';
import { FEN_LIBRARY } from '../lib/fen';
import { Command } from '../../rx-workflow/commands';
import { lastValueFrom } from 'rxjs';
import { Color } from '../types';

test('example interaction with ui workflow', async () => {
  const ctrl = new Orchestrator();
  const lastUpdate = lastValueFrom(ctrl.workflow.updates$);

  const actions: (Action | EngineAction)[] = [];
  ctrl.workflow.updates$.subscribe(([_, action]) => {
    if (action.type === Type.LoadEngineDone) {
      action.instance.engine.workflow.updates$.subscribe(([_, action]) => {
        actions.push(action);
      });
    }
    actions.push(action);
  });
  ctrl.workflow.emit(
    setPositionFromFENAction(FEN_LIBRARY.STARTING_POSITION_FEN),
  );
  ctrl.workflow.emit(clickSquareAction(12));
  ctrl.workflow.emit(clickSquareAction(28));
  ctrl.workflow.emit(loadEngineAction(Color.White));

  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  ctrl.workflow.emit(Command.Done);

  await lastUpdate;

  expect(
    actions
      .map(({ type }) => type)
      .filter((type) => type !== Type.TickPlayersClock),
  ).toEqual([
    Type.SetPositionFromFEN, // boot
    Type.SetPosition,
    Type.OverlaySquares,
    Type.ClickSquare, // click E2
    Type.OverlaySquares,
    Type.ClickSquare, // click E4
    Type.MovePiece,
    Type.SetPosition,
    Type.OverlaySquares,
    Type.AttemptEngineMove,
    Type.LoadEngine, // click "Load white engine"
    Type.LoadEngineDone,
    EngineType.UCI,
    EngineType.Respond,
    Type.EngineResponse,
    EngineType.Respond,
    Type.EngineResponse,
    EngineType.Respond,
    Type.EngineResponse,
    EngineType.Respond,
    Type.EngineResponse,
    EngineType.Debug,
    EngineType.IsReady,
    EngineType.LoadSearchExecutor,
    EngineType.LoadSearchExecutorDone,
    EngineType.Respond,
    Type.EngineResponse,
  ]);
});
