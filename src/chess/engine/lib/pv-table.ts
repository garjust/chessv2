import { Move } from '../../types';

/**
 * Triangular PV table.
 *
 * As the search deepens the PV grows further along the array:
 * ∅
 * m4
 * m3 m4
 * m2 m3 m4
 * m1 m2 m3 m4
 *
 * Hence the triangular structure. Note that the table starts with an extra null
 * size array to make the copy of the shorter PV safe.
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
