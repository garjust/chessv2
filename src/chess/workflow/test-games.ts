import { from, map, mergeMap, Observable } from 'rxjs';
import { clickSquareAction } from './action';
import { labelToSquare } from '../utils';
import { Action } from '.';
import { delayOperator } from '../../lib/operators';

type TestGameMoveSet = [string, string][];

export const VIENNA_GAMBIT_ACCEPTED_GAME: TestGameMoveSet = [
  ['e2', 'e4'],
  ['e7', 'e5'],
  ['b1', 'c3'],
  ['g8', 'f6'],
  ['f2', 'f4'],
  ['e5', 'f4'],
  ['e4', 'e5'],
  ['f6', 'g8'],
  ['g1', 'f3'],
  ['d7', 'd6'],
  ['d2', 'd4'],
  ['d6', 'e5'],
  ['d4', 'e5'],
  ['d8', 'd1'],
  ['e1', 'd1'],
  ['c8', 'g4'],
  ['f1', 'b5'],
  ['b8', 'c6'],
  ['c1', 'f4'],
  ['e8', 'c8'],
];

export const runTestGame = (
  actionDelay = 0,
  squareLabelTuples: TestGameMoveSet
): Observable<Action> =>
  from(squareLabelTuples).pipe(
    map(([labelA, labelB]) => [labelToSquare(labelA), labelToSquare(labelB)]),
    mergeMap(([squareA, squareB]) => from([squareA, squareB])),
    map((square) => clickSquareAction(square)),
    delayOperator(actionDelay)
  );
