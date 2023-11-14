import './GameControlPanel.css';
import { VIENNA_GAMBIT_ACCEPTED_GAME } from '../lib/example-games';
import { FEN_LIBRARY } from '../lib/fen';
import { Color } from '../types';
import { State } from './workflow';
import {
  changeOverlayAction,
  flipBoardAction,
  loadEngineAction,
  setPositionFromFENAction,
  toggleSquareLabelsAction,
} from './workflow/action';
import { moveActions } from './workflow/moves-to-actions';
import { useWorkflow } from './workflow-context';

const render = (state: State) => ({
  state,
});

const GameControlPanel = ({ style }: { style?: React.CSSProperties }) => {
  const { emit } = useWorkflow(render);

  function emitExampleGame(): void {
    emit(setPositionFromFENAction(FEN_LIBRARY.STARTING_POSITION_FEN));
    moveActions(VIENNA_GAMBIT_ACCEPTED_GAME, 200).subscribe({
      next: emit,
    });
  }

  return (
    <div className="game-control-panel" style={style}>
      <button onClick={() => emit(flipBoardAction())}>Flip the board</button>
      <button onClick={() => emit(toggleSquareLabelsAction())}>
        Toggle square labels
      </button>
      <button onClick={() => emit(changeOverlayAction())}>
        Switch overlay
      </button>
      <button onClick={() => emit(loadEngineAction(Color.Black))}>
        Load black engine
      </button>
      <button onClick={() => emit(loadEngineAction(Color.White))}>
        Load white engine
      </button>
      <button onClick={emitExampleGame}>Example game</button>
    </div>
  );
};

export default GameControlPanel;
