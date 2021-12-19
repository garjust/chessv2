import React, { CSSProperties, useEffect, useState } from 'react';
import Board from './Board';
import './Game.css';
import init, { createState } from '../engine';
import { updateLogger } from '../../lib/workflow';
import {
  flipBoardAction,
  initializeAction,
  loadChessComputerAction,
  setPositionFromFENAction,
  toggleSquareLabelsAction,
} from '../engine/action';
import { WorkflowContext } from './workflow';
import DisplayGameState from './DisplayGameState';
import { Color } from '../types';
import { STARTING_POSITION_FEN } from '../lib/fen';
import { debugGame } from '../debug';
import DisplayGameFEN from './DisplayGameFen';

const BUTTON_CSS: CSSProperties = {
  padding: 16,
  cursor: 'pointer',
};

const Game = () => {
  const { states, emit, updates } = init(createState(), {});

  updates.subscribe(updateLogger('Chess'));

  useEffect(() => {
    emit(initializeAction(Color.White));
    emit(setPositionFromFENAction(STARTING_POSITION_FEN));
  });

  function emitExampleGame(): void {
    emit(setPositionFromFENAction(STARTING_POSITION_FEN));
    debugGame(400).subscribe({
      next: (action) => emit(action),
    });
  }

  return (
    <div className="game">
      <WorkflowContext.Provider value={{ states, emit, updates }}>
        <Board squareSize={64} style={{ gridArea: 'board' }} />

        <div
          style={{
            gridArea: 'buttons',
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, min-content)',
          }}
        >
          <button style={BUTTON_CSS} onClick={() => emit(flipBoardAction())}>
            Flip the board
          </button>
          <button
            style={BUTTON_CSS}
            onClick={() => emit(toggleSquareLabelsAction())}
          >
            Toggle square labels
          </button>
          <button
            style={BUTTON_CSS}
            onClick={() => {
              emit(setPositionFromFENAction(STARTING_POSITION_FEN));
            }}
          >
            Reset game
          </button>
          <button style={BUTTON_CSS} onClick={emitExampleGame}>
            Example game
          </button>
          <button
            style={BUTTON_CSS}
            onClick={() => emit(loadChessComputerAction(Color.Black))}
          >
            Load black computer
          </button>
          <button
            style={BUTTON_CSS}
            onClick={() => emit(loadChessComputerAction(Color.White))}
          >
            Load white computer
          </button>
        </div>

        <DisplayGameState style={{ gridArea: 'state' }} />
        <DisplayGameFEN style={{ gridArea: 'fen' }} />
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
