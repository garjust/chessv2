import TimerSync from '../../../lib/timer-sync';

// /** Communication with web workers is slow, too slow to do at every node.
//  *
//  * Instead of asking the timer if it has reached 0 at every node we instead
//  * will only check the actual timer once per X ms. X should be larger than or
//  * equal to the timer tick rate.
//  */
// const TIMER_SAMPLE_RATE = 200;

// /** Make an assumption about how long it takes to process a node in the search
//  * tree.
//  */
// const MICROSECONDS_PER_NODE = 50;

// /** Caculate a threshold using the assumption for μs/node and the sample rate.
//  * We also assume the timer is read exactly once per node.
//  */
// const TIMER_SAMPLE_THRESHOLD =
//   (TIMER_SAMPLE_RATE * 1000) / MICROSECONDS_PER_NODE;

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
      sampleNodes: 50000,
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
