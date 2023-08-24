import { UCIResponse, EngineOptionName } from './uci-response';

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

// Spec: https://backscattering.de/chess/uci/
export declare namespace Action {
  export namespace UCICommand {
    // Initialization command. engine should expect this command after start
    // to set UCI mode. More useful when an engine program can operate in other
    // modes.
    export interface UCI {
      readonly type: Type.UCICommand.UCI;
    }

    export interface Debug {
      readonly type: Type.UCICommand.Debug;
      readonly value: boolean;
    }

    // Used to synchronize with the engine.
    // - Should always be sent after initialization before a first search
    // - Can be sent when engine is calculating (and respond immediately without
    // interupting search)
    export interface IsReady {
      readonly type: Type.UCICommand.IsReady;
    }

    // Set an option the engine supports
    export interface SetOption {
      readonly type: Type.UCICommand.SetOption;
      readonly name: EngineOptionName;
      readonly value: string;
    }

    export interface Register {
      readonly type: Type.UCICommand.Register;
    }

    // Instruct the engine the next position and search will be a new game
    export interface UCINewGame {
      readonly type: Type.UCICommand.UCINewGame;
    }

    // Set the chess position.
    export interface Position {
      readonly type: Type.UCICommand.Position;
      readonly fen: string;
      readonly moves: string[];
    }

    // Run a search in the current position!
    export interface Go {
      readonly type: Type.UCICommand.Go;
      readonly command: GoCommand;
    }

    // Stop caluclating as soon as possible.
    export interface Stop {
      readonly type: Type.UCICommand.Stop;
    }

    //
    export interface PonderHit {
      readonly type: Type.UCICommand.PonderHit;
    }

    // Quit the engine program.
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

const debugAction = (value: boolean): Action.UCICommand.Debug => ({
  type: Type.UCICommand.Debug,
  value,
});

const isReadyAction = (): Action.UCICommand.IsReady => ({
  type: Type.UCICommand.IsReady,
});

const setOptionAction = (
  name: EngineOptionName,
  value: string,
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
  moves: string[],
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
  response: UCIResponse,
): Action.Internal.Respond => ({
  type: Type.Internal.Respond,
  response,
});
