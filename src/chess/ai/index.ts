import { Move, Position } from '../types';
import { parseFEN } from '../fen';
import { nextMove as nextMoveV1 } from './v1';

export interface ChessComputer {
  nextMoveForFEN(fenString: string): Move;
  nextMove(position: Position): Move;
}

export const v1: ChessComputer = {
  nextMove: nextMoveV1,
  nextMoveForFEN: (fenString) => nextMoveV1(parseFEN(fenString)),
};
