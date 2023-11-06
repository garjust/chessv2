import { formatNumber } from './formatter';
import Logger from './logger';

const logger = new Logger('timer');

export default class Timer {
  readonly label;
  readonly tickRate;
  readonly #debug;

  value;
  #lastTick = 0;
  #tickerId?: NodeJS.Timeout;

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
    this.#debug = debug;

    logger.debug(`created ${label}`, { timeout, tickRate, autoStart });

    if (autoStart) {
      this.start();
    }
  }

  brrring(): boolean {
    return this.value === 0;
  }

  start(timeout?: number) {
    if (this.#tickerId !== undefined) {
      throw new Error(`timer ${this.label} already started`);
    }
    if (timeout) {
      this.value = timeout;
    }

    logger.debug(`started ${this.label}`, { timeout: this.value });

    this.#lastTick = Date.now();
    this.#tickerId = setInterval(() => {
      const tick = Date.now();
      this.value -= tick - this.#lastTick;
      this.#lastTick = tick;
      if (this.#debug) {
        logger.debug(`${this.label} tick`, this.value);
      }

      if (this.value <= 0) {
        logger.debug(`${this.label} reached 0`);
        this.value = 0;
        this.stop();
      }
    }, this.tickRate);
  }

  stop() {
    if (this.#debug) {
      logger.debug(`${this.label} stopped`);
    }
    if (this.#tickerId) {
      clearInterval(this.#tickerId);
      this.#tickerId = undefined;
    }
  }
}
