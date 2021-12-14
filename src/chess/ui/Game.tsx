import React, { useEffect } from 'react';
import Board from './Board';
import './Game.css';
import init, {
  createState,
  initializeAction,
  setPositionFromFENAction,
  toggleSquareLabelsAction,
} from '../engine';
import { updateLogger } from '../../lib/workflow';
import { flipBoardAction } from '../engine';
import { WorkflowContext } from './workflow';
import DisplayGameState from './DisplayGameState';
import { Color } from '../types';
import { movePieceAction } from '../engine/action';
import { STARTING_POSITION_FEN } from '../fen';

const moves = (function* () {
  while (true) {
    yield {
      from: { rank: 1, file: 3 },
      to: { rank: 3, file: 3 },
    };
    yield {
      from: { rank: 6, file: 4 },
      to: { rank: 5, file: 4 },
    };
  }
})();

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
          <button onClick={() => emit(movePieceAction(moves.next().value))}>
            Move something
          </button>
          <button
            onClick={() =>
              emit(setPositionFromFENAction(STARTING_POSITION_FEN))
            }
          >
            Reset game
          </button>
        </div>

        <DisplayGameState style={{ gridArea: 'state' }} />
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
