import type { Remote } from 'comlink';
import type Timer from '../../lib/timer';
import type { SearchExecutor } from '../engine/search-executor';

export const loadPerftWorker = async (): Promise<
  [engine: Worker, cleanup: () => void]
> => {
  const { loadPerft: load } = await import('./webworker');
  return load();
};

export const loadSearchExecutorWorker = async (
  ...args: ConstructorParameters<typeof SearchExecutor>
): Promise<[engine: Remote<SearchExecutor>, cleanup: () => void]> => {
  if (USE_NODE_WORKER_THREAD) {
    const { loadSearchExecutor: load } = await import('./worker-thread');
    return load(...args);
  } else {
    const { loadSearchExecutor: load } = await import('./webworker');
    return load(...args);
  }
};

export const loadTimerWorker = async (
  ...args: ConstructorParameters<typeof Timer>
): Promise<[engine: Remote<Timer>, cleanup: () => void]> => {
  if (USE_NODE_WORKER_THREAD) {
    const { loadTimer: load } = await import('./worker-thread');
    return load(...args);
  } else {
    const { loadTimer: load } = await import('./webworker');
    return load(...args);
  }
};
