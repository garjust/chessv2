import React, { useEffect } from 'react';
import Board from './Board';
import './Game.css';
import init, {
  createState,
  initializeAction,
  toggleSquareLabelsAction,
} from '../workflow';
import { updateLogger } from '../../lib/workflow';
import { flipBoardAction } from '../workflow';
import { WorkflowContext } from './workflow';
import DisplayGameState from './DisplayGameState';
import { Color } from '../types';

const Game = () => {
  const { states, emit, updates } = init(createState(), {});

  updates.subscribe(updateLogger('Chess'));

  useEffect(() => {
    emit(initializeAction(Color.White));
  });

  return (
    <div className="game">
      <WorkflowContext.Provider value={{ states, emit, updates }}>
        <Board squareSize={64} style={{ gridArea: 'board' }} />

        <div style={{ gridArea: 'buttons' }}>
          <button onClick={() => emit(flipBoardAction())}>
            Flip the board
          </button>
          <button onClick={() => emit(toggleSquareLabelsAction())}>
            Toggle square labels
          </button>
        </div>

        <DisplayGameState style={{ gridArea: 'state' }} />
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
