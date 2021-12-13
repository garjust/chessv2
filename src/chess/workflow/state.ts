import { Color } from '../types';

export interface State {
  boardOrientation: Color;
}

const INITIAL_STATE: State = {
  boardOrientation: Color.White,
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});
