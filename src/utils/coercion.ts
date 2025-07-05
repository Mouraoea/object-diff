/**
 * Type coercion utilities for comparing values with different types
 */

/**
 * Attempts to coerce two values to the same type for comparison
 * @param valueA First value
 * @param valueB Second value
 * @returns Object with coerced values and whether they are equal
 */
export function coerceValues(
  valueA: unknown,
  valueB: unknown
): {
  coercedA: unknown;
  coercedB: unknown;
  areEqual: boolean;
} {
  // If both values are null or undefined, they're equal
  if (valueA == null && valueB == null) {
    return { coercedA: valueA, coercedB: valueB, areEqual: true };
  }

  // If one is null/undefined and the other isn't, they're not equal
  if (valueA == null || valueB == null) {
    return { coercedA: valueA, coercedB: valueB, areEqual: false };
  }

  // If types are already the same, no coercion needed
  if (typeof valueA === typeof valueB) {
    return { coercedA: valueA, coercedB: valueB, areEqual: valueA === valueB };
  }

  // Handle number vs string coercion
  if (typeof valueA === 'number' && typeof valueB === 'string') {
    const coercedB = Number(valueB);
    if (!isNaN(coercedB)) {
      return { coercedA: valueA, coercedB, areEqual: valueA === coercedB };
    }
  }

  if (typeof valueA === 'string' && typeof valueB === 'number') {
    const coercedA = Number(valueA);
    if (!isNaN(coercedA)) {
      return { coercedA, coercedB: valueB, areEqual: coercedA === valueB };
    }
  }

  // Handle boolean vs string coercion
  if (typeof valueA === 'boolean' && typeof valueB === 'string') {
    const coercedB = valueB.toLowerCase();
    if (coercedB === 'true' || coercedB === 'false') {
      return {
        coercedA: valueA,
        coercedB: coercedB === 'true',
        areEqual: valueA === (coercedB === 'true'),
      };
    }
  }

  if (typeof valueA === 'string' && typeof valueB === 'boolean') {
    const coercedA = valueA.toLowerCase();
    if (coercedA === 'true' || coercedA === 'false') {
      return {
        coercedA: coercedA === 'true',
        coercedB: valueB,
        areEqual: (coercedA === 'true') === valueB,
      };
    }
  }

  // Handle Date vs string coercion
  if (valueA instanceof Date && typeof valueB === 'string') {
    const coercedB = new Date(valueB);
    if (!isNaN(coercedB.getTime())) {
      return {
        coercedA: valueA,
        coercedB,
        areEqual: valueA.getTime() === coercedB.getTime(),
      };
    }
  }

  if (typeof valueA === 'string' && valueB instanceof Date) {
    const coercedA = new Date(valueA);
    if (!isNaN(coercedA.getTime())) {
      return {
        coercedA: coercedA,
        coercedB: valueB,
        areEqual: coercedA.getTime() === valueB.getTime(),
      };
    }
  }

  // Handle number vs boolean coercion
  if (typeof valueA === 'number' && typeof valueB === 'boolean') {
    return {
      coercedA: valueA,
      coercedB: valueB ? 1 : 0,
      areEqual: valueA === (valueB ? 1 : 0),
    };
  }

  if (typeof valueA === 'boolean' && typeof valueB === 'number') {
    return {
      coercedA: valueA ? 1 : 0,
      coercedB: valueB,
      areEqual: (valueA ? 1 : 0) === valueB,
    };
  }

  // If no coercion is possible, values are not equal
  return { coercedA: valueA, coercedB: valueB, areEqual: false };
}

/**
 * Checks if a value can be coerced to a number
 */
export function canCoerceToNumber(value: unknown): boolean {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

/**
 * Checks if a value can be coerced to a boolean
 */
export function canCoerceToBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'false';
  }
  return false;
}

/**
 * Checks if a value can be coerced to a Date
 */
export function canCoerceToDate(value: unknown): boolean {
  if (value instanceof Date) return true;
  if (typeof value === 'string') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
}
