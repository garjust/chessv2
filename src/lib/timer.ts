import Logger from './logger';

const logger = new Logger('timer');

export default class Timer {
  readonly label;
  readonly tickRate;

  #value: number;
  #tickerId?: NodeJS.Timeout;
  #current?: Promise<void>;

  constructor(
    timeout: number,
    { tickRate = 50, label = 'anonymous', autoStart = true } = {},
  ) {
    this.#value = timeout;
    this.label = label;
    this.tickRate = tickRate;

    logger.debug(`created ${label}`, { timeout, tickRate, autoStart });

    if (autoStart) {
      this.start();
    }
  }

  public get value() {
    return this.#value;
  }

  public get promise() {
    return this.#current;
  }

  brrring(): boolean {
    return this.#value === 0;
  }

  start(timeout?: number): Promise<void> {
    if (this.#tickerId !== undefined) {
      throw new Error(`timer ${this.label} already started`);
    }
    if (timeout) {
      this.#value = timeout;
    }

    logger.debug(`started ${this.label}`, { timeout: this.value });

    this.#current = new Promise((resolve) => {
      let lastTick = Date.now();
      this.#tickerId = setInterval(() => {
        const tick = Date.now();
        this.#value -= tick - lastTick;
        lastTick = tick;

        if (this.value <= 0) {
          this.#value = 0;
          resolve();
          this.stop();
        }
      }, this.tickRate);
    });
    return this.#current;
  }

  stop() {
    if (this.#tickerId) {
      clearInterval(this.#tickerId);
      this.#tickerId = undefined;
      // TODO: should not be reseting the promise here. As is the timer can
      // "restart" and should restart on the same promise.
      this.#current = undefined;
      logger.debug(`${this.label} stopped`);
    } else {
      logger.debug(`${this.label} stopped but was not running`);
    }
  }
}
