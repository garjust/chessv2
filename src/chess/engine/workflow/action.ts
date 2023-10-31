import { Version } from '../registry';
import { ExecutorInstance } from './state';
import { UCIResponse, EngineOptionName, EngineOption } from './uci-response';

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

export enum Type {
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

export enum InternalType {
  Respond = 'RESPOND',
  LoadSearchExecutor = 'LOAD_SEARCH_EXECUTOR',
  LoadSearchExecutorDone = 'LOAD_SEARCH_EXECUTOR_DONE',
}

// Spec: https://backscattering.de/chess/uci/
// Initialization command. engine should expect this command after start
// to set UCI mode. More useful when an engine program can operate in other
// modes.
export interface UCIAction {
  readonly type: Type.UCI;
}

export interface DebugAction {
  readonly type: Type.Debug;
  readonly value: boolean;
}

// Used to synchronize with the engine.
// - Should always be sent after initialization before a first search
// - Can be sent when engine is calculating (and respond immediately without
// interupting search)
export interface IsReadyAction {
  readonly type: Type.IsReady;
}

// Set an option the engine supports
export interface SetOptionAction {
  readonly type: Type.SetOption;
  readonly option: EngineOption;
}

export interface RegisterAction {
  readonly type: Type.Register;
}

// Instruct the engine the next position and search will be a new game
export interface UCINewGameAction {
  readonly type: Type.UCINewGame;
}

// Set the chess position.
export interface PositionAction {
  readonly type: Type.Position;
  readonly fen: 'startpos' | string;
  readonly moves: string[];
}

// Run a search in the current position!
export interface GoAction {
  readonly type: Type.Go;
  readonly command: GoCommand;
}

// Stop caluclating as soon as possible.
export interface StopAction {
  readonly type: Type.Stop;
}

//
export interface PonderHitAction {
  readonly type: Type.PonderHit;
}

// Quit the engine program.
export interface QuitAction {
  readonly type: Type.Quit;
}

export interface RespondAction {
  readonly type: InternalType.Respond;
  readonly response: UCIResponse;
}

export interface LoadSearchExecutorAction {
  readonly type: InternalType.LoadSearchExecutor;
  readonly version: Version;
  readonly maxDepth: number;
}

export interface LoadSearchExecutorDoneAction {
  readonly type: InternalType.LoadSearchExecutorDone;
  readonly instance: ExecutorInstance;
}

export type Action =
  | UCIAction
  | DebugAction
  | IsReadyAction
  | SetOptionAction
  | RegisterAction
  | UCINewGameAction
  | PositionAction
  | GoAction
  | StopAction
  | PonderHitAction
  | QuitAction
  | RespondAction
  | LoadSearchExecutorAction
  | LoadSearchExecutorDoneAction;

export const uciAction = (): UCIAction => ({
  type: Type.UCI,
});

export const debugAction = (value: boolean): DebugAction => ({
  type: Type.Debug,
  value,
});

export const isReadyAction = (): IsReadyAction => ({
  type: Type.IsReady,
});

export const setOptionAction = (option: EngineOption): SetOptionAction => ({
  type: Type.SetOption,
  option,
});

export const registerAction = (): RegisterAction => ({
  type: Type.Register,
});

export const uciNewGameAction = (): UCINewGameAction => ({
  type: Type.UCINewGame,
});

export const positionAction = (
  fen: string,
  moves: string[] = [],
): PositionAction => ({
  type: Type.Position,
  fen,
  moves,
});

export const goAction = (command?: GoCommand): GoAction => ({
  type: Type.Go,
  command: command ? command : {},
});

export const stopAction = (): StopAction => ({
  type: Type.Stop,
});

export const ponderHitAction = (): PonderHitAction => ({
  type: Type.PonderHit,
});

export const quitAction = (): QuitAction => ({
  type: Type.Quit,
});

export const respondAction = (response: UCIResponse): RespondAction => ({
  type: InternalType.Respond,
  response,
});

export const loadSearchExecutorAction = (
  version: Version,
  maxDepth: number,
): LoadSearchExecutorAction => ({
  type: InternalType.LoadSearchExecutor,
  version,
  maxDepth,
});

export const loadSearchExecutorDoneAction = (
  instance: ExecutorInstance,
): LoadSearchExecutorDoneAction => ({
  type: InternalType.LoadSearchExecutorDone,
  instance,
});
