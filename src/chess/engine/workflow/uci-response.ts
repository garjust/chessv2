import { moveString } from '../../move-notation';
import { Move } from '../../types';

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

type InfoKey =
  | 'depth'
  | 'time'
  | 'nodes'
  | 'pv'
  | 'score'
  | 'currmove'
  | 'currmovenumber'
  | 'hashfull'
  | 'nps';

export type EngineOptionName = 'OwnBook' | 'Hash';

const OptionOwnBook = {
  name: 'OwnBook',
  type: 'check',
  default: true,
};

const OptionHash = {
  name: 'Hash',
  type: 'spin',
  default: 128,
  min: 128,
  max: 1024,
};

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
  | { type: UCIResponseType.Info; data: Record<InfoKey, string> }
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
      return [`info ${Object.entries(response.data).flat().join(' ')}`];
    case UCIResponseType.Option:
      switch (response.name) {
        case 'OwnBook':
          return [optionToResponse(OptionOwnBook)];
        case 'Hash':
          return [optionToResponse(OptionHash)];
      }
  }
};

export const toUCI = (...responses: UCIResponse[]): string[] =>
  responses.map((r) => toUCIString(r)).flat();
