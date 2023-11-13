import { Version } from '../search-executor';
import { ExecutorInstance } from './state';
import { Info, UCIResponse } from './uci-response';
import { EngineOption } from './uci-options';
import { Move } from '../../types';
import { Observable } from 'rxjs';

export type GoCommand = Partial<{
  searchmoves: Move[];
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
  Respond = 'RESPOND',
  LoadSearchExecutor = 'LOAD_SEARCH_EXECUTOR',
  LoadSearchExecutorDone = 'LOAD_SEARCH_EXECUTOR_DONE',
}

// Spec: https://backscattering.de/chess/uci/
// Initialization command. engine should expect this command after start
// to set UCI mode. More useful when an engine program can operate in other
// modes.
export const uciAction = () =>
  ({
    type: Type.UCI,
  }) as const;

export const debugAction = (value: boolean) =>
  ({
    type: Type.Debug,
    value,
  }) as const;

// Used to synchronize with the engine.
// - Should always be sent after initialization before a first search
// - Can be sent when engine is calculating (and respond immediately without
// interupting search)
export const isReadyAction = () =>
  ({
    type: Type.IsReady,
  }) as const;

export const setOptionAction = (option: EngineOption) =>
  ({
    type: Type.SetOption,
    option,
  }) as const;

export const registerAction = () =>
  ({
    type: Type.Register,
  }) as const;

export const uciNewGameAction = () =>
  ({
    type: Type.UCINewGame,
  }) as const;

export const positionAction = (fen: string, moves: readonly Move[] = []) =>
  ({
    type: Type.Position,
    fen,
    moves,
  }) as const;

export const goAction = (command?: GoCommand) =>
  ({
    type: Type.Go,
    command: command ? command : {},
  }) as const;

// Stop caluclating as soon as possible.
export const stopAction = () =>
  ({
    type: Type.Stop,
  }) as const;

export const ponderHitAction = () =>
  ({
    type: Type.PonderHit,
  }) as const;

export const quitAction = () =>
  ({
    type: Type.Quit,
  }) as const;

export const respondAction = (response: UCIResponse) =>
  ({
    type: Type.Respond,
    response,
  }) as const;

export const loadSearchExecutorAction = (version: Version) =>
  ({
    type: Type.LoadSearchExecutor,
    version,
  }) as const;

export const loadSearchExecutorDoneAction = (
  instance: ExecutorInstance,
  infoFromExecutor$: Observable<Info>,
) =>
  ({
    type: Type.LoadSearchExecutorDone,
    instance,
    infoFromExecutor$,
  }) as const;

export type Action =
  | ReturnType<typeof debugAction>
  | ReturnType<typeof goAction>
  | ReturnType<typeof isReadyAction>
  | ReturnType<typeof loadSearchExecutorAction>
  | ReturnType<typeof loadSearchExecutorDoneAction>
  | ReturnType<typeof ponderHitAction>
  | ReturnType<typeof positionAction>
  | ReturnType<typeof quitAction>
  | ReturnType<typeof registerAction>
  | ReturnType<typeof respondAction>
  | ReturnType<typeof setOptionAction>
  | ReturnType<typeof stopAction>
  | ReturnType<typeof uciAction>
  | ReturnType<typeof uciNewGameAction>;

export type Public = Exclude<
  Action,
  | (Action & { type: Type.LoadSearchExecutor })
  | (Action & { type: Type.LoadSearchExecutorDone })
  | (Action & { type: Type.Respond })
>;
