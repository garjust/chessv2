import { Observable } from 'rxjs';
import { pick } from '../random';
import Logger from '../logger';

interface ActionWithType {
  type: string;
}

const pickColor = (() => {
  const colors = [
    'skyblue',
    'orange',
    'greenyellow',
    'yellow',
    'darkseagreen',
    'plum',
    'aquamarine',
  ];
  let index = Math.floor(Math.random() * colors.length);

  return () => {
    index = (index + 1) % colors.length;
    return colors[index];
  };
})();

/* eslint-disable no-console */
export const updateLogger = <S, A extends ActionWithType>(
  workflowName: string,
  ignoreList: string[] = [],
) => {
  const color = pickColor();
  console.log(`%c${workflowName} workflow logger INIT`, `color: ${color};`);

  return ([[before, after], action]: [[S, S], A]) => {
    if (ignoreList.includes(action.type)) {
      return;
    }

    console.groupCollapsed(
      `%c${workflowName} Workflow Update:`,
      `font-weight: bold; color: ${color};`,
      action.type,
    );

    console.log('%c \u2B07 previous state', 'color: Crimson', before);
    console.log('%c \u2B07 emitted action', 'color: DodgerBlue', action);
    console.log('%c \u2B95 resulting state', 'color: ForestGreen', after);

    console.groupEnd();
  };
};
/* eslint-enable no-console */

export const immutableStateWatcher = <S extends object>(
  matchFn: (state: S) => string = JSON.stringify,
) => {
  const stateHistory: { state: S; blob: string }[] = [];
  const logger = new Logger('state-watcher');

  const review = () => {
    for (const { state, blob } of stateHistory) {
      if (matchFn(state) !== blob) {
        logger.warn(
          `detected a state mutation`,
          stateHistory[stateHistory.length - 1],
        );
      }
    }
  };

  return (state: S) => {
    stateHistory.push({ state, blob: matchFn(state) });
    review();
  };
};
