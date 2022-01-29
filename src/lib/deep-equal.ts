export function equal(a: unknown[], b: unknown[]): boolean;
export function equal(
  a: Map<unknown, unknown>,
  b: Map<unknown, unknown>
): boolean;
export function equal(a: unknown, b: unknown): boolean;

export function equal(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) {
      return false;
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) {
        return false;
      }
      for (const [key, value] of a) {
        if (!b.has(key)) {
          return false;
        }
        if (!equal(value, b.get(key))) {
          return false;
        }
      }
      return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length - 1; i++) {
        if (!b.some((bValue) => equal(bValue, a[i]))) {
          return false;
        }
      }
    }

    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) {
      return false;
    }
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (
        !equal(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      ) {
        return false;
      }
    }
  }

  return true;
}
