import { Position } from '../../types';
import { FEN_LIBRARY, parseFEN } from '../fen';

export interface State {
  debug: boolean;
  positionForGo: Position;
}

const INITIAL_STATE: State = {
  debug: false,
  positionForGo: parseFEN(FEN_LIBRARY.BLANK_POSITION_FEN),
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});
