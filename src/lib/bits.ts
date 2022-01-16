export function formatBits(bits: number): string;
export function formatBits(bits: bigint): string;
export function formatBits(bits: number | bigint) {
  if (typeof bits === 'number') {
    return (bits | 0b0).toString(2).padStart(32, '0');
  } else {
    return (bits | 0b0n).toString(2).padStart(64, '0');
  }
}

export const formatAsBytes = (bitString: string) => {
  const parts: string[] = [];
  for (let i = 0; i < bitString.length; i += 8) {
    parts.push(bitString.slice(i, i + 8));
  }

  return parts.join(':');
};
