import { Move } from '../../types';

/**
 * Triangular PV table.
 */
export default class PVTable {
  private table: Move[][];

  constructor(maxPlies: number) {
    this.table = [];
    for (let i = 0; i <= maxPlies; i++) {
      this.table.push([]);
    }
  }

  set(depth: number, move: Move): void {
    this.table[depth] = [move, ...this.table[depth - 1]];
  }

  get pv(): Move[] {
    return [...this.table[this.table.length - 1]];
  }
}
