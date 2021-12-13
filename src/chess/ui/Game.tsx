import React from 'react';
import Board from './Board';
import './Game.css';
import init, { createState, initializeAction } from '../workflow';
import { updateLogger } from '../../lib/workflow';
import { flipBoardAction } from '../workflow/action';
import { WorkflowContext } from './workflow';
import DisplayGameState from './DisplayGameState';

const Game = () => {
  const { states, emit, updates } = init(createState(), {});

  updates.subscribe(updateLogger('Chess'));

  emit(initializeAction('1'));

  return (
    <div className="game">
      <WorkflowContext.Provider value={{ states, emit, updates }}>
        <Board squareSize={64} style={{ gridArea: 'board' }} />

        <div style={{ gridArea: 'buttons' }}>
          <button onClick={() => emit(flipBoardAction())}>
            Flip the board
          </button>
        </div>

        <DisplayGameState style={{ gridArea: 'state' }} />
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
