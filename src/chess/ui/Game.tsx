import { useEffect, useState } from 'react';
import Board from './Board';
import './Game.css';
import { WorkflowContext } from './workflow-context';
import DisplayGameState from './DisplayGameState';
import DisplayGameFEN from './DisplayGameFen';
import DisplayClock from './DisplayClock';
import GameControlPanel from './GameControlPanel';
import { Orchestrator } from './orchestrator';

const Game = () => {
  const [orchestrator, _] = useState<Orchestrator>(new Orchestrator());

  return (
    <div className="game">
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
