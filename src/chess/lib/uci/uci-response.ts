import { moveString } from '../../move-notation';
import { Move } from '../../types';

export enum UCIResponseType {
  Id,
  UCIOk,
  ReadyOk,
  BestMove,
  CopyProtection,
  Registration,
  Info,
  Option,
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

function optionToResponse(
  option: Record<string, string | number | boolean>,
): string {
  let str = '';
  for (const [k, v] of Object.entries(option)) {
    str += `${k} ${v} `;
  }
  return str.trim();
}

export type UCIResponse =
  | { type: UCIResponseType.Id; name: string; author: 'garjust' }
  | { type: UCIResponseType.UCIOk }
  | { type: UCIResponseType.ReadyOk }
  | { type: UCIResponseType.BestMove; move: Move; ponder?: Move }
  | { type: UCIResponseType.CopyProtection }
  | { type: UCIResponseType.Registration }
  | { type: UCIResponseType.Info; data: Record<InfoKey, string> }
  | { type: UCIResponseType.Option; name: EngineOptionName };

export const toUCIString = (response: UCIResponse): string[] => {
  let str: string;
  switch (response.type) {
    case UCIResponseType.Id:
      return [`id name ${response.name}\n`, `id author ${response.author}\n`];
    case UCIResponseType.UCIOk:
      return ['uciok\n'];
    case UCIResponseType.ReadyOk:
      return ['readyok\n'];
    case UCIResponseType.BestMove:
      str = `bestmove ${moveString(response.move)}`;
      if (response.ponder !== undefined) {
        str += ` ponder ${moveString(response.ponder)}`;
      }
      return [`${str}\n`];
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
