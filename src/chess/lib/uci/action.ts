import { UCIResponse } from './uci-response';

export type GoCommand = Partial<{
  searchmoves: string[];
  ponder: boolean;
  wtime: number;
  btime: number;
  winc: number;
  binc: number;
  movestogo: number;
  depth: number;
  nodes: number;
  mate: number;
  movetime: number;
  infinite: boolean;
}>;

export declare namespace Type {
  enum UCICommand {
    UCI = 'UCI',
    Debug = 'DEBUG',
    IsReady = 'IS_READY',
    SetOption = 'SET_OPTION',
    Register = 'REGISTER',
    UCINewGame = 'UCI_NEW_GAME',
    Position = 'POSITION',
    Go = 'GO',
    Stop = 'STOP',
    PonderHit = 'PONDER_HIT',
    Quit = 'QUIT',
  }

  enum Internal {
    Respond = 'RESPOND',
  }
}

export declare namespace Action {
  export namespace UCICommand {
    export interface UCI {
      readonly type: Type.UCICommand.UCI;
    }

    export interface Debug {
      readonly type: Type.UCICommand.Debug;
      readonly value: boolean;
    }

    export interface IsReady {
      readonly type: Type.UCICommand.IsReady;
    }

    export interface SetOption {
      readonly type: Type.UCICommand.SetOption;
      readonly name: string;
      readonly value: string;
    }

    export interface Register {
      readonly type: Type.UCICommand.Register;
    }

    export interface UCINewGame {
      readonly type: Type.UCICommand.UCINewGame;
    }

    export interface Position {
      readonly type: Type.UCICommand.Position;
      readonly fen: string;
      readonly moves: string[];
    }

    export interface Go {
      readonly type: Type.UCICommand.Go;
      readonly command: GoCommand;
    }

    export interface Stop {
      readonly type: Type.UCICommand.Stop;
    }

    export interface PonderHit {
      readonly type: Type.UCICommand.PonderHit;
    }

    export interface Quit {
      readonly type: Type.UCICommand.Quit;
    }
  }

  export namespace Internal {
    export interface Respond {
      readonly type: Type.Internal.Respond;
      readonly response: UCIResponse;
    }
  }
}

export type Action =
  | Action.UCICommand.UCI
  | Action.UCICommand.Debug
  | Action.UCICommand.IsReady
  | Action.UCICommand.SetOption
  | Action.UCICommand.Register
  | Action.UCICommand.UCINewGame
  | Action.UCICommand.Position
  | Action.UCICommand.Go
  | Action.UCICommand.Stop
  | Action.UCICommand.PonderHit
  | Action.UCICommand.Quit
  | Action.Internal.Respond;

const uciAction = (): Action.UCICommand.UCI => ({
  type: Type.UCICommand.UCI,
});

const debugAction = ([value]: string[]): Action.UCICommand.Debug => ({
  type: Type.UCICommand.Debug,
  value: value === 'on' ? true : false,
});

const isReadyAction = (): Action.UCICommand.IsReady => ({
  type: Type.UCICommand.IsReady,
});

const setOptionAction = (
  name: string,
  value: string
): Action.UCICommand.SetOption => ({
  type: Type.UCICommand.SetOption,
  name,
  value,
});

const registerAction = (): Action.UCICommand.Register => ({
  type: Type.UCICommand.Register,
});

const uciNewGameAction = (): Action.UCICommand.UCINewGame => ({
  type: Type.UCICommand.UCINewGame,
});

const positionAction = (
  fen: string,
  moves: string[]
): Action.UCICommand.Position => ({
  type: Type.UCICommand.Position,
  fen,
  moves,
});

const goAction = (command: GoCommand): Action.UCICommand.Go => ({
  type: Type.UCICommand.Go,
  command,
});

const stopAction = (): Action.UCICommand.Stop => ({
  type: Type.UCICommand.Stop,
});

const ponderHitAction = (): Action.UCICommand.PonderHit => ({
  type: Type.UCICommand.PonderHit,
});

const quitAction = (): Action.UCICommand.Quit => ({
  type: Type.UCICommand.Quit,
});

export const UCICommandAction = {
  uciAction,
  debugAction,
  isReadyAction,
  setOptionAction,
  registerAction,
  uciNewGameAction,
  positionAction,
  goAction,
  stopAction,
  ponderHitAction,
  quitAction,
};

export const respondAction = (
  response: UCIResponse
): Action.Internal.Respond => ({
  type: Type.Internal.Respond,
  response,
});
