import { Action } from '.';
import { FEN_LIBRARY } from '../../lib/fen';
import { moveFromString } from '../../move-notation';
import {
  GoCommand,
  debugAction,
  goAction,
  isReadyAction,
  ponderHitAction,
  positionAction,
  quitAction,
  registerAction,
  setOptionAction,
  stopAction,
  uciAction,
  uciNewGameAction,
} from './action';

const parseGoCommand = (parts: string[]): GoCommand => {
  const result: GoCommand = {};

  for (let cursor = parts.shift(); parts.length === 0; cursor = parts.shift()) {
    switch (cursor as keyof GoCommand) {
      case 'searchmoves':
        result.searchmoves = [...parts.map(moveFromString)];
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
      default:
        console.log('blah');
        break;
    }
  }

  return result;
};

export const parse = (commandString: string): Action => {
  const [command, ...args] = commandString.split(' ');
  let name, value, boolValue;

  switch (command) {
    case 'uci':
      return uciAction();
    case 'debug':
      [boolValue] = args;
      return debugAction(boolValue == 'on');
    case 'isready':
      return isReadyAction();
    case 'setoption': {
      [, name, , value] = args;
      switch (name) {
        case 'Hash':
          return setOptionAction({
            name,
            value: parseInt(value),
          });
        case 'OwnBook':
          return setOptionAction({
            name,
            value: value === 'true',
          });
        default:
          throw new Error(`invalid option name ${name}`);
      }
    }
    case 'register':
      return registerAction();
    case 'ucinewgame':
      return uciNewGameAction();
    case 'position': {
      const [fen, ...moveStrings] = args;
      const moves = moveStrings.map(moveFromString);

      return positionAction(
        fen === 'startpos' ? FEN_LIBRARY.STARTING_POSITION_FEN : fen,
        moves,
      );
    }
    case 'go': {
      return goAction(parseGoCommand(args));
    }
    case 'stop':
      return stopAction();
    case 'ponderhit':
      return ponderHitAction();
    case 'quit':
      return quitAction();
    default:
      console.log('blah');
      break;
  }

  throw Error(`unrecognized UCI command: "${commandString}"`);
};
