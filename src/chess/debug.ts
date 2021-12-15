import { delay, from, interval, map, mergeMap, Observable, zip } from 'rxjs';
import { clickSquareAction } from './engine/action';
import { labelToSquare } from './utils';
import { Action } from './engine';

const VIENNA_GAMBIT_ACCEPTED_GAME = [
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
];

export const debugGame = (
  actionDelay = 0,
  squareLabelTuples = VIENNA_GAMBIT_ACCEPTED_GAME
): Observable<Action> =>
  zip(
    from(squareLabelTuples).pipe(
      map(([labelA, labelB]) => [labelToSquare(labelA), labelToSquare(labelB)])
    ),
    interval(actionDelay)
  ).pipe(
    map(([squareTuple]) => squareTuple),
    mergeMap(([squareA, squareB]) => from([squareA, squareB])),
    map((square) => clickSquareAction(square))
  );
