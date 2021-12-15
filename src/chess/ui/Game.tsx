import React, { useEffect } from 'react';
import Board from './Board';
import './Game.css';
import init, { createState } from '../engine';
import { updateLogger } from '../../lib/workflow';
import {
  flipBoardAction,
  initializeAction,
  setPositionFromFENAction,
  toggleSquareLabelsAction,
} from '../engine/action';
import { WorkflowContext } from './workflow';
import DisplayGameState from './DisplayGameState';
import { Color } from '../types';
import { STARTING_POSITION_FEN } from '../fen';
import { debugGame } from '../debug';

const Game = () => {
  const { states, emit, updates } = init(createState(), {});

  updates.subscribe(updateLogger('Chess'));

  useEffect(() => {
    emit(initializeAction(Color.White));
    emit(setPositionFromFENAction(STARTING_POSITION_FEN));
  });

  const emitExampleGame = (): void => {
    debugGame(100).subscribe((action) => emit(action));
  };

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
          <button
            onClick={() => {
              emit(initializeAction(Color.White));
              emit(setPositionFromFENAction(STARTING_POSITION_FEN));
            }}
          >
            Reset game
          </button>
          <button
            onClick={() => {
              emitExampleGame();
            }}
          >
            Example game
          </button>
        </div>

        <DisplayGameState style={{ gridArea: 'state' }} />
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
