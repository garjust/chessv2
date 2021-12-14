import { Move, Position } from '../types';
import { parseFEN } from '../fen';
import { nextMove } from './v1';

export interface ChessComputer {
  nextMoveForFEN(fenString: string): Move;
  nextMove(position: Position): Move;
}

export const v1: ChessComputer = {
  nextMove,
  nextMoveForFEN: (fenString) => nextMove(parseFEN(fenString)),
};
