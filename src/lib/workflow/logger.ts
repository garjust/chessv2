import { createSpy } from './spy';

interface ActionWithType {
  type: string;
}

// const spy = createSpy();

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

  return {
    next([[before, after], action]: [[S, S], A]) {
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
    },
    error(err: unknown) {
      console.error(`${workflowName} ERROR`, err);
    },
    complete() {
      console.log(
        `%c${workflowName} Completed`,
        `font-weight: bold; color: ${color};`,
      );
    },
  };
};
/* eslint-enable no-console */
