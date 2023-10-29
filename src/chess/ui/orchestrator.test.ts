import { expect, test, vi } from 'vitest';
import { Orchestrator } from './orchestrator';
import { Action, setPositionFromFENAction } from './workflow';
import {
  EngineResponseAction,
  Type,
  clickSquareAction,
  loadChessComputerAction,
} from './workflow/action';
import { Action as EngineAction } from '../engine/workflow';
import { Type as EngineType, InternalType } from '../engine/workflow/action';
import { FEN_LIBRARY } from '../lib/fen';
import { Command } from '../../lib/workflow/commands';
import { lastValueFrom } from 'rxjs';
import { Color } from '../types';

test('example interaction with ui workflow', async () => {
  const ctrl = new Orchestrator();
  const lastUpdate = lastValueFrom(ctrl.workflow.updates);

  const actions: (Action | EngineAction)[] = [];
  ctrl.workflow.updates.subscribe(([_, action]) => {
    if (action.type === Type.ChessComputerLoaded) {
      action.instance.engine.workflow.updates.subscribe(([_, action]) => {
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
  ctrl.workflow.emit(loadChessComputerAction(Color.White));

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
    Type.AttemptComputerMove,
    Type.ClickSquare, // click E2
    Type.OverlaySquares,
    Type.ClickSquare, // click E4
    Type.MovePiece,
    Type.SetPosition,
    Type.OverlaySquares,
    Type.AttemptComputerMove,
    Type.LoadChessComputer, // click "Load white computer"
    Type.ChessComputerLoaded,
    EngineType.UCI,
    InternalType.Respond,
    Type.EngineResponse,
    InternalType.Respond,
    Type.EngineResponse,
    InternalType.Respond,
    Type.EngineResponse,
    InternalType.Respond,
    Type.EngineResponse,
    EngineType.Debug,
    EngineType.IsReady,
    InternalType.LoadSearchExecutor,
    InternalType.LoadSearchExecutorDone,
    InternalType.Respond,
    Type.EngineResponse,
  ]);
});
