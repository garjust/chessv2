import { expect, test, vi } from 'vitest';
import { Orchestrator } from './orchestrator';
import { Action, setPositionFromFENAction } from './workflow';
import {
  Type,
  clickSquareAction,
  loadChessComputerAction,
} from './workflow/action';
import { FEN_LIBRARY } from '../lib/fen';
import { Command } from '../../lib/workflow/commands';
import { lastValueFrom } from 'rxjs';
import { Color } from '../types';

test('example interaction with ui workflow', async () => {
  const ctrl = new Orchestrator();
  const lastValue = lastValueFrom(ctrl.workflow.updates);

  const actions: Action[] = [];
  ctrl.workflow.updates.subscribe(([_, action]) => {
    if (action.type === Type.TickPlayersClock) {
      return;
    }
    actions.push(action);
  });
  ctrl.workflow.emit(
    setPositionFromFENAction(FEN_LIBRARY.STARTING_POSITION_FEN),
  );
  ctrl.workflow.emit(clickSquareAction(12));
  ctrl.workflow.emit(clickSquareAction(28));
  ctrl.workflow.emit(loadChessComputerAction(Color.Black));
  ctrl.workflow.emit(Command.Done);

  await lastValue;

  expect(actions.map(({ type }) => type)).toEqual([
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
    Type.LoadChessComputer, // click "Load black computer"
    Type.ChessComputerLoaded,
  ]);
});
