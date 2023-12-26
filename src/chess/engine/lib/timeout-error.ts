export default class TimeoutError extends Error {
  constructor() {
    super('timeout');
  }
}
