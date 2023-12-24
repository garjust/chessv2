import { CurrentZobrist } from '../../../lib/zobrist/types';
import { TranspositionTable, TranspositionTableEntry } from '../../types';
import { entryMeta, entryMove, unpackEntry } from './entry';

const CHECK_KEY_BYTES_SIZE = 8; // 1 64-bit number
const ENTRY_BYTES_SIZE = 8; // 1 64-bit number

/**
 * Define element size in **bytes** for ease of ArrayBuffer creation.
 */
const ELEMENT_BYTES_SIZE = CHECK_KEY_BYTES_SIZE + ENTRY_BYTES_SIZE;

const bytesFromMB = (mb: number): number => mb * 1000 * 1000;

/**
 * Implement a TTable using a raw ArrayBuffer of bytes.
 */
export default class TTableArrayBuffer
  implements TranspositionTable<TranspositionTableEntry>
{
  /**
   * Underlying buffer storing the table's bytes.
   */
  private readonly buffer: ArrayBuffer;
  /**
   * A view of the table's bytes as 32 bit unsigned integers. Each entry
   * takes up 4 elements.
   */
  private readonly data: Uint32Array;
  private readonly zobrist;
  private readonly sizeInElements;

  private hits = 0;
  private miss = 0;
  private type1 = 0;
  private size = 0;

  constructor(sizeInMB: number, zobrist: CurrentZobrist<[number, number]>) {
    const sizeInBytes = bytesFromMB(sizeInMB);
    if (sizeInBytes % ELEMENT_BYTES_SIZE !== 0) {
      throw new Error(`Cannot evenly divide ${sizeInMB}MB into elements`);
    }

    this.zobrist = zobrist;
    this.sizeInElements = sizeInBytes / ELEMENT_BYTES_SIZE;
    this.buffer = new ArrayBuffer(sizeInBytes);
    this.data = new Uint32Array(this.buffer);
  }

  /**
   * Map half of a zobrist key (32 bits) to an index into the Uint32Array used
   * to store table entries.
   *
   * The key needs to be truncated down to enough bits to index an arraf of length
   * `sizeInElements`.
   *
   */
  private get index(): number {
    return (this.currentKey.key[0] % this.sizeInElements) * 4;
  }

  get(): TranspositionTableEntry | undefined {
    const key = this.zobrist.key;
    const i = this.index;

    if (this.data[i] === 0) {
      this.miss++;
      return undefined;
    } else if (this.data[i + 2] !== key[0] || this.data[i + 3] !== key[1]) {
      this.type1++;
      return undefined;
    } else {
      this.hits++;
    }

    return unpackEntry(this.data[i], this.data[i + 1]);
  }

  set(value: TranspositionTableEntry) {
    const key = this.zobrist.key;
    const i = this.index;
    if (this.data[i] === 0) {
      this.size++;
    }
    // Always replace
    this.data[i] = entryMeta(value);
    this.data[i + 1] = entryMove(value);
    this.data[i + 2] = key[0];
    this.data[i + 3] = key[1];
  }

  get currentKey() {
    return this.zobrist;
  }

  stats() {
    return {
      hits: this.hits,
      miss: this.miss,
      type1: this.type1,
      size: this.size,
      percentFull: this.size / this.sizeInElements,
    };
  }
}
