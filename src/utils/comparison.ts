import { coerceValues } from './coercion.js';

/**
 * Comparison utilities for diff operations
 */

/**
 * Checks if a property should be ignored based on the current path
 */
export function shouldIgnoreProperty(
  propertyPath: string,
  ignoreProperties: string[]
): boolean {
  if (!ignoreProperties || ignoreProperties.length === 0) {
    return false;
  }

  return ignoreProperties.some((ignorePath) => {
    // Exact match
    if (ignorePath === propertyPath) {
      return true;
    }
    // Wildcard match (e.g., user._* matches user._id, user._version)
    if (ignorePath.includes('*')) {
      // Convert wildcard to regex
      const regex = new RegExp(
        '^' +
          ignorePath
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*') +
          '$'
      );
      return regex.test(propertyPath);
    }
    // Prefix match (e.g., user matches user.name, user.profile.email)
    if (ignorePath.includes('.')) {
      return propertyPath.startsWith(ignorePath + '.');
    }
    // Simple property name match
    return propertyPath === ignorePath;
  });
}

/**
 * Compares two primitive values with optional type coercion
 */
export function comparePrimitives(
  valueA: unknown,
  valueB: unknown,
  enableTypeCoercion: boolean
): boolean {
  // Strict equality check first
  if (valueA === valueB) {
    return true;
  }

  // If type coercion is disabled, return false
  if (!enableTypeCoercion) {
    return false;
  }

  // Try type coercion
  const { areEqual } = coerceValues(valueA, valueB);
  return areEqual;
}

/**
 * Compares two arrays with configurable order sensitivity
 */
export function compareArrays(
  arrayA: unknown[],
  arrayB: unknown[],
  context: {
    depth: number;
    path: string[];
    options: {
      arrayOrderMatters: boolean;
      enableTypeCoercion: boolean;
      maxDepth: number;
      ignoreProperties: string[];
    };
  },
  internalDiff: (
    objA: unknown,
    objB: unknown,
    context: {
      depth: number;
      path: string[];
      options: {
        arrayOrderMatters: boolean;
        enableTypeCoercion: boolean;
        maxDepth: number;
        ignoreProperties: string[];
      };
    }
  ) => {
    additions: Record<string, unknown>;
    deletions: Record<string, unknown>;
    updates: Record<string, unknown>;
  }
): boolean {
  // Different lengths
  if (arrayA.length !== arrayB.length) {
    return false;
  }

  // Empty arrays are equal
  if (arrayA.length === 0) {
    return true;
  }

  // If order doesn't matter, sort both arrays ONCE for primitive arrays
  if (!context.options.arrayOrderMatters) {
    if (
      arrayA.every((item) => typeof item !== 'object' || item === null) &&
      arrayB.every((item) => typeof item !== 'object' || item === null)
    ) {
      const sortedA = [...arrayA].sort();
      const sortedB = [...arrayB].sort();
      for (let i = 0; i < sortedA.length; i++) {
        if (
          !comparePrimitives(
            sortedA[i],
            sortedB[i],
            context.options.enableTypeCoercion
          )
        ) {
          return false;
        }
      }
      return true;
    }
    // For arrays of objects, fallback to order-sensitive comparison for now
  }

  // Compare elements in order
  for (let i = 0; i < arrayA.length; i++) {
    const itemA = arrayA[i];
    const itemB = arrayB[i];

    // If both are primitives, use primitive comparison
    if (typeof itemA !== 'object' || itemA === null || Array.isArray(itemA)) {
      if (typeof itemB !== 'object' || itemB === null || Array.isArray(itemB)) {
        if (
          !comparePrimitives(itemA, itemB, context.options.enableTypeCoercion)
        ) {
          return false;
        }
        continue;
      }
    }

    // If both are objects (not arrays), use object comparison
    if (
      typeof itemA === 'object' &&
      itemA !== null &&
      !Array.isArray(itemA) &&
      typeof itemB === 'object' &&
      itemB !== null &&
      !Array.isArray(itemB)
    ) {
      if (context.depth < context.options.maxDepth) {
        const diffResult = internalDiff(itemA, itemB, {
          ...context,
          depth: context.depth + 1,
          path: [...context.path, i.toString()],
        });

        // If there are any differences, arrays are not equal
        if (
          Object.keys(diffResult.additions).length > 0 ||
          Object.keys(diffResult.deletions).length > 0 ||
          Object.keys(diffResult.updates).length > 0
        ) {
          return false;
        }
        continue;
      }
    }

    // If we reach here, types are incompatible or max depth reached
    return false;
  }

  return true;
}

/**
 * Creates a nested object from a path array
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown
): void {
  let current = obj as Record<string, unknown>;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (
      !(key in current) ||
      typeof current[key] !== 'object' ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  // If value is an object and the last key already exists and is an object, merge
  const lastKey = path[path.length - 1];
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof current[lastKey] === 'object' &&
    current[lastKey] !== null &&
    !Array.isArray(value) &&
    !Array.isArray(current[lastKey])
  ) {
    current[lastKey] = { ...current[lastKey], ...value };
  } else {
    current[lastKey] = value;
  }
}

/**
 * Gets a nested value from an object using a path array
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string[]
): unknown {
  let current: unknown = obj;

  for (const key of path) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Checks if a value is a plain object (not null, not array, not Date, etc.)
 */
export function isPlainObject(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof RegExp) &&
    !(value instanceof Map) &&
    !(value instanceof Set)
  );
}
