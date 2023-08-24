interface ActionWithType {
  type: string;
}

/* eslint-disable no-console */
export const updateLogger =
  <S, A extends ActionWithType>(
    workflowName: string,
    ignoreList: string[] = [],
  ) =>
  ([[before, after], action]: [[S, S], A]) => {
    if (ignoreList.includes(action.type)) {
      return;
    }

    console.groupCollapsed(
      `%c${workflowName} Workflow Update:`,
      'font-weight: bold; color: orange;',
      action.type,
    );

    console.log('%c \u2B07 previous state', 'color: Crimson', before);
    console.log('%c \u2B07 emitted action', 'color: DodgerBlue', action);
    console.log('%c \u2B95 resulting state', 'color: ForestGreen', after);

    console.groupEnd();
  };
/* eslint-enable no-console */
