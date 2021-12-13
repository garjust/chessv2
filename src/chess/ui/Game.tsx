import React from 'react';
import Board from './Board';
import init, { createState, initializeAction } from '../workflow';
import WorkflowContext from './WorkflowContext';
import { updateLogger } from '../../lib/workflow';
import { flipBoardAction } from '../workflow/action';

const Game = () => {
  const { states, emit, updates } = init(createState(), {});

  updates.subscribe(updateLogger('Chess'));

  emit(initializeAction('1'));

  return (
    <div
      style={{
        margin: 100,
      }}
    >
      <WorkflowContext.Provider value={{ states, emit, updates }}>
        <Board squareSize={64} />

        <button onClick={() => emit(flipBoardAction())}>Flip the board</button>
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
