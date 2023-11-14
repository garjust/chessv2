import { useEffect, useState } from 'react';
import { Observable, Subject, Subscriber } from 'rxjs';

export const useObservable = <T>(): {
  obs$: Observable<T>;
  next: (val: T) => void;
} => {
  const [subject$] = useState(new Subject<T>());
  return {
    obs$: subject$.asObservable(),
    next(t: T) {
      subject$.next(t);
    },
  };
};

export const useSubscription = <T>(
  obs$: Observable<T>,
  subscriber: Subscriber<T> | ((value: T) => void),
) => {
  useEffect(() => {
    console.debug('subscribe...');
    const sub = obs$.subscribe(subscriber);
    return () => sub.unsubscribe();
  }, [obs$, subscriber]);
};
