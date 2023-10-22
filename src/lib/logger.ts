export default class Logger {
  name: string;

  constructor(name: string) {
    this.name = `[${name}]`;
  }

  debug(...args: unknown[]) {
    console.debug(this.name, ...args);
  }

  info(...args: unknown[]) {
    console.log(this.name, ...args);
  }

  warn(...args: unknown[]) {
    console.warn(this.name, ...args);
  }

  error(...args: unknown[]) {
    console.error(this.name, ...args);
  }
}
