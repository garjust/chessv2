import React, { useEffect } from 'react';
import Board from './Board';
import './Game.css';
import init, { createState, Type } from '../workflow';
import { updateLogger } from '../../lib/workflow';
import {
  changeOverlayAction,
  flipBoardAction,
  loadChessComputerAction,
  previousPositionAction,
  setPositionFromFENAction,
  tickPlayersClockAction,
  toggleSquareLabelsAction,
} from '../workflow/action';
import { WorkflowContext } from './workflow';
import DisplayGameState from './DisplayGameState';
import { Color } from '../types';
import { FEN_LIBRARY } from '../lib/fen';
import { moveActions } from '../workflow/moves-to-actions';
import DisplayGameFEN from './DisplayGameFen';
import { BUTTON_CSS } from './theme';
import Engine from '../engine';
import { interval, map } from 'rxjs';
import { VIENNA_GAMBIT_ACCEPTED_GAME } from '../lib/example-games';
import DisplayClock from './DisplayClock';

const FEN_FOR_INITIAL_POSITION = FEN_LIBRARY.STARTING_POSITION_FEN;

const Game = () => {
  const { states, emit, updates } = init(createState(), {
    engine: new Engine(),
  });

  updates.subscribe(updateLogger('Chess', [Type.TickPlayersClock]));

  useEffect(() => {
    const ticker = interval(100).pipe(map(() => tickPlayersClockAction()));
    const subscription = ticker.subscribe(emit);
    return () => {
      subscription.unsubscribe();
    };
  });

  useEffect(() => {
    emit(setPositionFromFENAction(FEN_FOR_INITIAL_POSITION));
  });

  function emitExampleGame(): void {
    emit(setPositionFromFENAction(FEN_LIBRARY.STARTING_POSITION_FEN));
    moveActions(VIENNA_GAMBIT_ACCEPTED_GAME, 400).subscribe({
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
          <button
            style={BUTTON_CSS}
            onClick={() => emit(changeOverlayAction())}
          >
            Switch overlay
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
          <button style={BUTTON_CSS} onClick={emitExampleGame}>
            Example game
          </button>
        </div>

        <DisplayClock style={{ gridArea: 'clock' }} />

        <DisplayGameState style={{ gridArea: 'state' }} />
        <DisplayGameFEN style={{ gridArea: 'fen' }} />
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
