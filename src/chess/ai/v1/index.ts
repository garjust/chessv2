import { ChessComputer } from '../types';
import { Move, Position } from '../../types';

export default class AI implements ChessComputer {
  nextMove(position: Position): Move {
    return {
      from: {
        rank: 3,
        file: 3,
      },
      to: {
        rank: 4,
        file: 3,
      },
    };
  }
}
