import { Subject } from 'rxjs';

/** Built-in "action" */
export enum Command {
  /** Instruct the workflow that it should complete all observables. */
  Done = 'command__DONE',
}

export const isCommand = (value: unknown): value is Command =>
  value === Command.Done;

export const commandExecutor =
  <T>(root$: Subject<T>) =>
  // Note: return an unused value here to create a type check error when a new
  // command is added without handling it here.
  (command: Command): boolean => {
    switch (command) {
      case Command.Done:
        root$.complete();
        return true;
    }
  };
