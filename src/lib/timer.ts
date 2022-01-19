import { formatNumber } from './formatter';

export type TimerConstructor = {
  new (
    timeout: number,
    options: {
      label?: string;
      tickRate?: number;
      autoStart?: boolean;
      debug?: boolean;
    }
  ): Timer;
};

export default class Timer {
  readonly label;
  readonly tickRate;
  readonly _debug;

  value = 0;
  _lastTick = 0;
  _tickerId?: NodeJS.Timer;

  constructor(
    timeout: number,
    { tickRate = 50, label = 'anonymous', debug = false, autoStart = true } = {}
  ) {
    this.label = label;
    this.tickRate = tickRate;
    this._debug = debug;

    if (this._debug) {
      console.log(
        '[TIMER]',
        `created timer ${label}: ${formatNumber(
          timeout
        )}ms; tickRate=${tickRate}ms`
      );
    }

    if (autoStart) {
      this.start(timeout);
    }
  }

  brrring(): boolean {
    return this.value === 0;
  }

  start(timeout: number) {
    if (this._debug) {
      console.log(
        '[TIMER]',
        `started ${this.label}: ${formatNumber(timeout)}ms`
      );
    }

    this.value = timeout;
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
