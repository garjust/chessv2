import './GameControlPanel.css';
import { VIENNA_GAMBIT_ACCEPTED_GAME } from '../lib/example-games';
import { FEN_LIBRARY } from '../lib/fen';
import { Color } from '../types';
import { State } from './workflow';
import {
  changeOverlayAction,
  flipBoardAction,
  loadChessComputerAction,
  previousPositionAction,
  setPositionFromFENAction,
  toggleSquareLabelsAction,
} from './workflow/action';
import { moveActions } from './workflow/moves-to-actions';
import { useWorkflow } from './workflow-context';

const render = (state: State) => ({
  state,
});

const GameControlPanel = () => {
  const { emit } = useWorkflow(render);

  function emitExampleGame(): void {
    emit(setPositionFromFENAction(FEN_LIBRARY.STARTING_POSITION_FEN));
    moveActions(VIENNA_GAMBIT_ACCEPTED_GAME, 400).subscribe({
      next: (action) => emit(action),
    });
  }

  return (
    <div className="game-control-panel">
      <button onClick={() => emit(flipBoardAction())}>Flip the board</button>
      <button onClick={() => emit(toggleSquareLabelsAction())}>
        Toggle square labels
      </button>
      <button
        onClick={() => {
          emit(previousPositionAction());
        }}
      >
        Go back
      </button>
      <button onClick={() => emit(changeOverlayAction())}>
        Switch overlay
      </button>
      <button onClick={() => emit(loadChessComputerAction(Color.Black))}>
        Load black computer
      </button>
      <button onClick={() => emit(loadChessComputerAction(Color.White))}>
        Load white computer
      </button>
      <button onClick={emitExampleGame}>Example game</button>
    </div>
  );
};

export default GameControlPanel;
