import { interval, map, Observable, OperatorFunction, zip } from 'rxjs';

// Delays the events in the source observable evenly by the eventDelay.
export const delayOperator =
  <T>(eventDelay: number): OperatorFunction<T, T> =>
  (observable: Observable<T>) =>
    zip(observable, interval(eventDelay)).pipe(map(([t]) => t));
