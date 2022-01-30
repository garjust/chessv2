import { Action } from '.';
import { FEN_LIBRARY } from '../fen';
import { GoCommand, UCICommandAction } from './action';

const parseGoCommand = (parts: string[]): GoCommand => {
  const result: GoCommand = {};

  for (let cursor = parts.shift(); parts.length === 0; cursor = parts.shift()) {
    switch (cursor as keyof GoCommand) {
      case 'searchmoves':
        result.searchmoves = [...parts];
        parts.length = 0;
        break;
      case 'ponder':
        result.ponder = true;
        break;
      case 'wtime':
        result.wtime = Number(parts.shift());
        break;
      case 'btime':
        result.btime = Number(parts.shift());
        break;
      case 'winc':
        result.winc = Number(parts.shift());
        break;
      case 'binc':
        result.binc = Number(parts.shift());
        break;
      case 'movestogo':
        result.movestogo = Number(parts.shift());
        break;
      case 'depth':
        result.depth = Number(parts.shift());
        break;
      case 'nodes':
        result.nodes = Number(parts.shift());
        break;
      case 'mate':
        result.mate = Number(parts.shift());
        break;
      case 'movetime':
        result.movetime = Number(parts.shift());
        break;
      case 'infinite':
        result.infinite = true;
        break;
    }
  }

  return result;
};

export const parse = (commandString: string): Action => {
  const [command, ...args] = commandString.split(' ');

  switch (command) {
    case 'uci':
      return UCICommandAction.uciAction();
    case 'debug':
      return UCICommandAction.debugAction(args);
    case 'isready':
      return UCICommandAction.isReadyAction();
    case 'setoption': {
      const [, name, , value] = args;
      return UCICommandAction.setOptionAction(name, value);
    }
    case 'register':
      return UCICommandAction.registerAction();
    case 'ucinewgame':
      return UCICommandAction.uciNewGameAction();
    case 'position': {
      const [fen, ...moves] = args;
      return UCICommandAction.positionAction(
        fen === 'startpos' ? FEN_LIBRARY.STARTING_POSITION_FEN : fen,
        moves
      );
    }
    case 'go': {
      return UCICommandAction.goAction(parseGoCommand(args));
    }
    case 'stop':
      return UCICommandAction.stopAction();
    case 'ponderhit':
      return UCICommandAction.ponderHitAction();
    case 'quit':
      return UCICommandAction.quitAction();
  }

  throw Error(`unrecognized UCI command: "${commandString}"`);
};
