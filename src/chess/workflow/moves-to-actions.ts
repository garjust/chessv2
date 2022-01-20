import { from, map, mergeMap, Observable } from 'rxjs';
import { clickSquareAction } from './action';
import { moveFromString } from '../utils';
import { Action } from '.';
import { delayOperator } from '../../lib/operators';

export const moveActions = (
  moves: string[],
  actionDelay = 0
): Observable<Action> =>
  from(moves).pipe(
    map(moveFromString),
    map((move) => [move.from, move.to]),
    mergeMap(([squareA, squareB]) => from([squareA, squareB])),
    map(clickSquareAction),
    delayOperator(actionDelay)
  );
