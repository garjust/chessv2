export enum Type {
  Initialize = 'INITIALIZE',
}

export declare namespace Action {
  export interface Initialize {
    readonly type: Type.Initialize;
    readonly value: string;
  }
}

export type Action = Action.Initialize;

export const initializeAction = (value: string): Action.Initialize => ({
  type: Type.Initialize,
  value,
});
