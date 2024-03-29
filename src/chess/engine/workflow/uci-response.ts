import { moveString } from '../../move-notation';
import { Move } from '../../types';
import { EngineOptionName, OptionDefinitions } from './uci-options';

export enum UCIResponseType {
  Id = 'ID',
  UCIOk = 'UCIOK',
  ReadyOk = 'READYOK',
  BestMove = 'BEST_MOVE',
  CopyProtection = 'COPY_PROTECTION',
  Registration = 'REGISTRATION',
  Info = 'INFO',
  Option = 'OPTION',
}

export type InfoKey =
  // search depth in plies
  | 'depth'
  // the time searched in ms, this should be sent together with the pv.
  | 'time'
  // x nodes searched, the engine should send this info regularly
  | 'nodes'
  // the best line found
  | 'pv'
  | 'score'
  // currently searching this move
  | 'currmove'
  // currently searching move number x, for the first move x should be 1 not 0.
  | 'currmovenumber'
  // the hash is x permill full, the engine should send this info regularly
  | 'hashfull'
  // x nodes per second searched, the engine should send this info regularly
  | 'nps'
  | 'string';

export type Info = Partial<Record<InfoKey, string>>;

const optionToResponse = (
  option: Record<string, string | number | boolean>,
): string => {
  let str = 'option';
  for (const [k, v] of Object.entries(option)) {
    str += ` ${k} ${v}`;
  }
  return str;
};

export type UCIResponse =
  | { type: UCIResponseType.Id; name: string; author: 'garjust' }
  | { type: UCIResponseType.UCIOk }
  | { type: UCIResponseType.ReadyOk }
  | { type: UCIResponseType.BestMove; move: Move; ponder?: Move }
  | { type: UCIResponseType.CopyProtection }
  | { type: UCIResponseType.Registration }
  | { type: UCIResponseType.Info; info: Info }
  | { type: UCIResponseType.Option; name: EngineOptionName };

const toUCIString = (response: UCIResponse): string[] => {
  let str: string;
  switch (response.type) {
    case UCIResponseType.Id:
      return [`id name ${response.name}`, `id author ${response.author}`];
    case UCIResponseType.UCIOk:
      return ['uciok'];
    case UCIResponseType.ReadyOk:
      return ['readyok'];
    case UCIResponseType.BestMove:
      str = `bestmove ${moveString(response.move)}`;
      if (response.ponder !== undefined) {
        str += ` ponder ${moveString(response.ponder)}`;
      }
      return [`${str}`];
    case UCIResponseType.CopyProtection:
      throw Error('engine is not copyrighted');
    case UCIResponseType.Registration:
      throw Error('engine does not need registration');
    case UCIResponseType.Info:
      return [`info ${Object.entries(response.info).flat().join(' ')}`];
    case UCIResponseType.Option:
      switch (response.name) {
        case 'Hash':
          return [optionToResponse(OptionDefinitions.Hash)];
        case 'OwnBook':
          return [optionToResponse(OptionDefinitions.OwnBook)];
      }
  }
};

export const toUCI = (...responses: UCIResponse[]): string[] =>
  responses.map((r) => toUCIString(r)).flat();
