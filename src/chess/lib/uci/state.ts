export interface State {
  debug: boolean;
}

const INITIAL_STATE: State = {
  debug: false,
};

export const createState = (overrides: Partial<State> = {}): State => ({
  ...INITIAL_STATE,
  ...overrides,
});
