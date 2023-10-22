import { Position } from '../../types';
import { FEN_LIBRARY, parseFEN } from '../../lib/fen';
import { SearchExecutor } from '../search-executor';
import { Remote } from 'comlink';

export type ExecutorInstance = {
  executor: Remote<SearchExecutor>;
  cleanup: () => void;
  // This property is here to indicate to JSON.stringify replacer function
  // what type of object this is to avoid serializing the comlink remote
  // object. JSON.stringify does something to the wrapped WebWorker before
  // it hits the replacer function that explodes.
  __computer: true;
};

export interface State {
  debug: boolean;
  positionForGo: Position;
  executorInstance: ExecutorInstance | null;
}

const INITIAL_STATE: State = {
  debug: false,
  positionForGo: parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN),
  executorInstance: null,
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});
