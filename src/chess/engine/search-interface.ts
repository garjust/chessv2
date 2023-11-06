import { Move, Position } from '../types';
import { Info } from './workflow/uci-response';

export type InfoReporter = (info: Info) => void;

export type SearchLimit = { nodes?: number; depth?: number; time?: number };

export interface SearchConstructor {
  new (infoReporter: InfoReporter): SearchInterface;
}

export interface SearchInterface {
  nextMove(
    position: Position,
    movesToSearch: Move[],
    timeout: number,
    limits: SearchLimit,
  ): Promise<Move>;
  ponderMove(position: Position, move: Move): void;
}
