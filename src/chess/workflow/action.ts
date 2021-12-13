import { Color } from '../types';

export enum Type {
  FlipBoard = 'FLIP_BOARD',
  Initialize = 'INITIALIZE',
  SetPositionFromFEN = 'SET_POSITION_FRM_FEN',
  ToggleSquareLabels = 'TOGGLE_SQUARE_LABELS',
}

export declare namespace Action {
  export interface FlipBoard {
    readonly type: Type.FlipBoard;
  }

  export interface Initialize {
    readonly type: Type.Initialize;
    readonly playingAs: Color;
  }

  export interface SetPositionFromFEN {
    readonly type: Type.SetPositionFromFEN;
    readonly fenString: string;
  }

  export interface ToggleSquareLabels {
    readonly type: Type.ToggleSquareLabels;
  }
}

export type Action =
  | Action.FlipBoard
  | Action.Initialize
  | Action.SetPositionFromFEN
  | Action.ToggleSquareLabels;

export const flipBoardAction = (): Action.FlipBoard => ({
  type: Type.FlipBoard,
});

export const initializeAction = (playingAs: Color): Action.Initialize => ({
  type: Type.Initialize,
  playingAs,
});

export const setPositionFromFENAction = (
  fenString: string
): Action.SetPositionFromFEN => ({
  type: Type.SetPositionFromFEN,
  fenString,
});

export const toggleSquareLabelsAction = (): Action.ToggleSquareLabels => ({
  type: Type.ToggleSquareLabels,
});
