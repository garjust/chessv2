import { useEffect, useState } from 'react';
import Board from './Board';
import './Game.css';
import { WorkflowContext } from './workflow-context';
import DisplayGameState from './DisplayGameState';
import DisplayGameFEN from './DisplayGameFen';
import DisplayClock from './DisplayClock';
import GameControlPanel from './GameControlPanel';
import { Orchestrator } from './orchestrator';
import { Command } from '../../lib/workflow/commands';
import {
  Navigate,
  navigatePositionAction,
  setPositionFromFENAction,
} from './workflow';
import { FEN_LIBRARY } from '../lib/fen';

const Game = () => {
  const [orchestrator, setOrchestrator] = useState<Orchestrator>();

  useEffect(() => {
    const newOrchestrator = new Orchestrator(true);
    setOrchestrator(newOrchestrator);

    newOrchestrator.workflow.emit(
      setPositionFromFENAction(FEN_LIBRARY.STARTING_POSITION_FEN),
    );

    return () => newOrchestrator.workflow.emit(Command.Done);
  }, []);

  return (
    <div
      className="game"
      onKeyDownCapture={(event) => {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            orchestrator?.workflow.emit(navigatePositionAction(Navigate.Back));
            break;
          case 'ArrowRight':
            event.preventDefault();
            orchestrator?.workflow.emit(
              navigatePositionAction(Navigate.Forward),
            );
            break;
          case 'ArrowUp':
            event.preventDefault();
            orchestrator?.workflow.emit(navigatePositionAction(Navigate.Start));
            break;
          case 'ArrowDown':
            event.preventDefault();
            orchestrator?.workflow.emit(
              navigatePositionAction(Navigate.Current),
            );
            break;
        }
      }}
    >
      {orchestrator ? (
        <WorkflowContext.Provider value={orchestrator.workflow}>
          <Board squareSize={64} style={{ gridArea: 'board' }} />

          <GameControlPanel />

          <DisplayClock style={{ gridArea: 'clock' }} />

          <DisplayGameState style={{ gridArea: 'state' }} />
          <DisplayGameFEN style={{ gridArea: 'fen' }} />
        </WorkflowContext.Provider>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Game;
