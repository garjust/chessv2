import { pick } from '../random';

interface ActionWithType {
  type: string;
}

const COLORS = [
  'orange',
  'yellow',
  'aqua',
  'aquamarine',
  'darkseagreen',
  'greenyellow',
  'yellowgreen',
  'skyblue',
  'plum',
  'chartreuse',
];

/* eslint-disable no-console */
export const updateLogger = <S, A extends ActionWithType>(
  workflowName: string,
  ignoreList: string[] = [],
) => {
  const color = pick(COLORS);

  console.log(`%c${workflowName} worfklow logger INIT`, `color: ${color};`);

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
