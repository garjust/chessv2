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

export type UCIResponse =
  | { type: UCIResponseType.Id; name: string; author: 'garjust' }
  | { type: UCIResponseType.UCIOk }
  | { type: UCIResponseType.ReadyOk }
  | { type: UCIResponseType.BestMove }
  | { type: UCIResponseType.CopyProtection }
  | { type: UCIResponseType.Registration }
  | { type: UCIResponseType.Info; data: Record<InfoKey, string> }
  | { type: UCIResponseType.Option };

export const toUCIString = (response: UCIResponse): string[] => {
  switch (response.type) {
    case UCIResponseType.Id:
      return [`id name ${response.name}\n`, `id author ${response.author}\n`];
    case UCIResponseType.UCIOk:
      return ['uciok\n'];
    case UCIResponseType.ReadyOk:
      return ['readyok\n'];
    case UCIResponseType.BestMove:
      return ['bestmove\n'];
    case UCIResponseType.CopyProtection:
      throw Error('engine is not copyrighted');
    case UCIResponseType.Registration:
      throw Error('engine does not need registration');
    case UCIResponseType.Info:
      return [`info ${Object.entries(response.data).flat().join(' ')}`];
    case UCIResponseType.Option:
      throw Error('no options supported');
  }
};
