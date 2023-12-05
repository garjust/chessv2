import { Position } from '../../types';
import { FEN_LIBRARY, parseFEN } from '../../lib/fen';
import { SearchExecutor } from '../search-executor';
import { Remote } from 'comlink';
import { Version } from '../search-executor';
import { OptionDefinitions } from './uci-options';

export type ExecutorInstance = {
  executor: Remote<SearchExecutor>;
  cleanup: () => void;
  toJSON(): unknown;
};

export const executorInstance = (
  executor: Remote<SearchExecutor>,
  cleanup: () => void,
): ExecutorInstance => ({
  executor,
  cleanup,
  toJSON() {
    return '{ search-executor worker }';
  },
});

export type State = Readonly<{
  debug: boolean;
  positionForGo: Readonly<Position>;
  config: Readonly<{
    version: Version;
  }>;
  options: Readonly<{
    hashSize: typeof OptionDefinitions.Hash.default;
    useBookMoves: typeof OptionDefinitions.OwnBook.default;
  }>;
  executorInstance: Readonly<ExecutorInstance> | null;
}>;

const INITIAL_STATE: State = {
  debug: false,
  positionForGo: parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN),
  config: {
    version: 'iterative',
  },
  options: {
    hashSize: OptionDefinitions.Hash.default,
    useBookMoves: OptionDefinitions.OwnBook.default,
  },
  executorInstance: null,
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});
