export enum Type {
  FlipBoard = 'FLIP_BOARD',
  Initialize = 'INITIALIZE',
}

export declare namespace Action {
  export interface FlipBoard {
    readonly type: Type.FlipBoard;
  }

  export interface Initialize {
    readonly type: Type.Initialize;
    readonly value: string;
  }
}

export type Action = Action.FlipBoard | Action.Initialize;

export const flipBoardAction = (): Action.FlipBoard => ({
  type: Type.FlipBoard,
});

export const initializeAction = (value: string): Action.Initialize => ({
  type: Type.Initialize,
  value,
});
