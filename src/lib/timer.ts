import { formatNumber } from './formatter';

export default class Timer {
  readonly label;
  readonly tickRate;
  readonly _debug;

  value;
  _lastTick = 0;
  _tickerId?: NodeJS.Timeout;

  constructor(
    timeout: number,
    {
      tickRate = 50,
      label = 'anonymous',
      debug = false,
      autoStart = true,
    } = {},
  ) {
    this.value = timeout;
    this.label = label;
    this.tickRate = tickRate;
    this._debug = debug;

    if (this._debug) {
      console.log(
        '[TIMER]',
        `created timer ${label}: ${formatNumber(
          timeout,
        )}ms; tickRate=${tickRate}ms`,
      );
    }

    if (autoStart) {
      this.start();
    }
  }

  brrring(): boolean {
    return this.value === 0;
  }

  start(timeout?: number) {
    if (timeout) {
      this.value = timeout;
    }

    if (this._debug) {
      console.log(
        '[TIMER]',
        `started ${this.label}: ${formatNumber(this.value)}ms`,
      );
    }

    this._lastTick = Date.now();
    this._tickerId = setInterval(() => {
      const tick = Date.now();
      this.value -= tick - this._lastTick;
      this._lastTick = tick;
      if (this._debug) {
        console.log('[TIMER]', `${this.label} tick ${this.value}`);
      }

      if (this.value <= 0) {
        if (this._debug) {
          console.log('[TIMER]', `${this.label} reached 0`);
        }
        this.value = 0;
        this.stop();
      }
    }, this.tickRate);
  }

  stop() {
    if (this._debug) {
      console.log('[TIMER]', `${this.label} stopped`);
    }
    if (this._tickerId) {
      clearInterval(this._tickerId);
    }
  }
}
