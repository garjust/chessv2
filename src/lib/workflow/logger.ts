interface ActionWithType {
  type: string;
}

/* eslint-disable no-console */
export const updateLogger =
  <S, A extends ActionWithType, C>(workflowName: string) =>
  ([[before, after], action, _]: [[S, S], A, C]) => {
    console.groupCollapsed(
      `%c${workflowName} Workflow Update:`,
      'font-weight: bold; color: orange;',
      action.type
    );

    console.log('%c \u2B07 previous state', 'color: Crimson', before);
    console.log('%c \u2B07 emitted action', 'color: DodgerBlue', action);
    console.log('%c \u2B95 resulting state', 'color: ForestGreen', after);

    console.groupEnd();
  };
/* eslint-enable no-console */
