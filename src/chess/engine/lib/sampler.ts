import TimerSync from '../../../lib/timer-sync';

/**
 * Manages a "sample rate" to periodically report diagnostic info about an
 * ongoing search.
 */
export default class Sampler {
  private timer: TimerSync;
  private counter: number;

  private nodeSampleRate: number;
  private timeSampleRate: number;

  constructor(
    {
      sampleMs,
      sampleNodes,
    }: {
      sampleMs: number;
      sampleNodes: number;
    } = {
      sampleMs: 1000,
      sampleNodes: 25000,
    },
  ) {
    this.timer = new TimerSync(sampleMs);
    this.counter = 0;
    this.timeSampleRate = sampleMs;
    this.nodeSampleRate = sampleNodes;
  }

  sample(): boolean {
    this.counter++;
    const sampleNow = this.timer.tick() || this.counter >= this.nodeSampleRate;
    if (sampleNow) {
      this.counter = 0;
      this.timer.start(this.timeSampleRate);
    }
    return sampleNow;
  }
}
