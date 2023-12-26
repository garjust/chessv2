import Logger from './logger';

const logger = new Logger('timer-sync');

export default class TimerSync {
  readonly label;

  #value: number;
  #lastTick = 0;

  constructor(timeout: number, { label = 'anonymous', autoStart = true } = {}) {
    this.#value = timeout;
    this.label = label;

    logger.debug(`created ${label}`, { timeout, autoStart });

    if (autoStart) {
      this.start();
    }
  }

  get value() {
    return this.#value;
  }

  brrring(): boolean {
    return this.#value === 0;
  }

  /**
   * Manually ticks the timer.
   */
  tick() {
    if (this.#value !== 0) {
      const tick = performance.now();
      this.#value -= tick - this.#lastTick;
      this.#lastTick = tick;
      if (this.#value <= 0) {
        this.#value = 0;
      }
    }
    return this.brrring();
  }

  start(timeout?: number) {
    if (timeout) {
      this.#value = timeout;
    }
    this.#lastTick = performance.now();
  }
}
