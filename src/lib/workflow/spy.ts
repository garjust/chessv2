import {
  CyclePlugin,
  GraphPlugin,
  SnapshotPlugin,
  StackTracePlugin,
  StatsPlugin,
  create,
  defaultLogger,
} from 'rxjs-spy';

export function createSpy() {
  const options = { warning: true };

  const spy = create({ ...options, defaultPlugins: false });

  spy.plug(new StackTracePlugin({ sourceMaps: false }));
  spy.plug(new GraphPlugin({ keptDuration: -1 }));
  spy.plug(new SnapshotPlugin(spy, { keptValues: 1 }));
  spy.plug(new CyclePlugin(spy, defaultLogger));
  spy.plug(new StatsPlugin(spy));

  // spy.log();

  return spy;
}
