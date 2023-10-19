export const pick = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];
