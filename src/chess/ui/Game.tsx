import React, { useEffect } from 'react';
import Board from './Board';
import './Game.css';
import init, { createState } from '../workflow';
import { updateLogger } from '../../lib/workflow';
import {
  flipBoardAction,
  initializeAction,
  loadChessComputerAction,
  previousPositionAction,
  setPositionFromFENAction,
  toggleSquareLabelsAction,
} from '../workflow/action';
import { WorkflowContext } from './workflow';
import DisplayGameState from './DisplayGameState';
import { Color } from '../types';
import {
  STARTING_POSITION_FEN,
  VIENNA_OPENING_FEN,
  VIENNA_GAMBIT_ACCEPTED_FEN,
} from '../lib/fen';
import {
  runTestGame,
  VIENNA_GAMBIT_ACCEPTED_GAME,
} from '../workflow/test-games';
import DisplayGameFEN from './DisplayGameFen';
import { BUTTON_CSS } from './theme';

const Game = () => {
  const { states, emit, updates } = init(createState(), {});

  updates.subscribe(updateLogger('Chess'));

  useEffect(() => {
    emit(initializeAction(Color.White));
    emit(setPositionFromFENAction(VIENNA_GAMBIT_ACCEPTED_FEN));
  });

  function emitExampleGame(): void {
    emit(setPositionFromFENAction(STARTING_POSITION_FEN));
    runTestGame(400, VIENNA_GAMBIT_ACCEPTED_GAME).subscribe({
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
              emit(previousPositionAction());
            }}
          >
            Go back
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
