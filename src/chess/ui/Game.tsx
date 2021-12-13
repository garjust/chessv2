import React from 'react';
import Board from './Board';
import init, { createState } from '../workflow';
import WorkflowContext from './WorkflowContext';
import { updateLogger } from '../../lib/workflow';

const Game = () => {
  const { states, emit, updates } = init(createState(), {});

  updates.subscribe(updateLogger('Chess'));

  return (
    <div
      style={{
        margin: 100,
      }}
    >
      <WorkflowContext.Provider value={{ states, emit, updates }}>
        <Board squareSize={64} />
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
