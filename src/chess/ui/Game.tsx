import { useEffect } from 'react';
import Board from './Board';
import './Game.css';
import init, { createState, Type } from './workflow';
import { updateLogger } from '../../lib/workflow';
import {
  setPositionFromFENAction,
  tickPlayersClockAction,
} from './workflow/action';
import { WorkflowContext } from './workflow-context';
import DisplayGameState from './DisplayGameState';
import { FEN_LIBRARY } from '../lib/fen';
import DisplayGameFEN from './DisplayGameFen';
import Core from '../core';
import { interval, map } from 'rxjs';
import DisplayClock from './DisplayClock';
import GameControlPanel from './GameControlPanel';

const FEN_FOR_INITIAL_POSITION = FEN_LIBRARY.STARTING_POSITION_FEN;

const Game = () => {
  const { states, emit, updates } = init(createState(), {
    engine: new Core(),
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

  return (
    <div className="game">
      <WorkflowContext.Provider value={{ states, emit, updates }}>
        <Board squareSize={64} style={{ gridArea: 'board' }} />

        <GameControlPanel />

        <DisplayClock style={{ gridArea: 'clock' }} />

        <DisplayGameState style={{ gridArea: 'state' }} />
        <DisplayGameFEN style={{ gridArea: 'fen' }} />
      </WorkflowContext.Provider>
    </div>
  );
};

export default Game;
