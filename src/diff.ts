import type { DiffOptions, DiffResult, ComparisonContext } from './types.js';
import {
  shouldIgnoreProperty,
  comparePrimitives,
  compareArrays,
  isPlainObject,
} from './utils/comparison.js';

/**
 * Default options for diff operations
 */
const DEFAULT_OPTIONS: Required<DiffOptions> = {
  ignoreProperties: [],
  enableTypeCoercion: true,
  arrayOrderMatters: true,
  maxDepth: 10,
};

/**
 * Internal diff function that handles the recursive comparison
 */
function internalDiff(
  objA: any,
  objB: any,
  context: ComparisonContext
): DiffResult {
  const result: DiffResult = {
    additions: {},
    deletions: {},
    updates: {},
  };

  // Handle null/undefined cases
  if (objA == null && objB == null) {
    return result;
  }

  if (objA == null) {
    result.additions = objB;
    return result;
  }

  if (objB == null) {
    result.deletions = objA;
    return result;
  }

  // Handle different types
  if (typeof objA !== typeof objB) {
    // Try type coercion if enabled
    if (context.options.enableTypeCoercion) {
      // For now, we'll treat different types as updates
      // This could be enhanced with more sophisticated type coercion
      result.updates = { from: objA, to: objB };
      return result;
    } else {
      result.updates = { from: objA, to: objB };
      return result;
    }
  }

  // Handle arrays
  if (Array.isArray(objA) && Array.isArray(objB)) {
    if (!compareArrays(objA, objB, context, internalDiff)) {
      result.updates = { from: objA, to: objB };
    }
    return result;
  }

  // Handle plain objects
  if (isPlainObject(objA) && isPlainObject(objB)) {
    return compareObjects(objA, objB, context);
  }

  // Handle primitives and other types
  if (!comparePrimitives(objA, objB, context.options.enableTypeCoercion)) {
    result.updates = { from: objA, to: objB };
  }

  return result;
}

/**
 * Compares two plain objects recursively
 */
function compareObjects(
  objA: Record<string, any>,
  objB: Record<string, any>,
  context: ComparisonContext
): DiffResult {
  const result: DiffResult = {
    additions: {},
    deletions: {},
    updates: {},
  };

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // Check for deletions (keys in A but not in B)
  for (const key of keysA) {
    const currentPath =
      context.path.length > 0 ? `${context.path.join('.')}.${key}` : key;

    if (shouldIgnoreProperty(currentPath, context.options.ignoreProperties)) {
      continue;
    }

    if (!(key in objB)) {
      result.deletions[key] = objA[key];
    }
  }

  // Check for additions and updates (keys in B)
  for (const key of keysB) {
    const currentPath =
      context.path.length > 0 ? `${context.path.join('.')}.${key}` : key;

    if (shouldIgnoreProperty(currentPath, context.options.ignoreProperties)) {
      continue;
    }

    if (!(key in objA)) {
      // Addition: key exists in B but not in A
      result.additions[key] = objB[key];
    } else {
      // Both objects have this key, compare values
      const valueA = objA[key];
      const valueB = objB[key];

      // Check if we should recurse deeper
      if (
        context.depth < context.options.maxDepth &&
        isPlainObject(valueA) &&
        isPlainObject(valueB)
      ) {
        // Recursive comparison for nested objects
        const nestedContext: ComparisonContext = {
          ...context,
          depth: context.depth + 1,
          path: [...context.path, key],
        };

        const nestedResult = internalDiff(valueA, valueB, nestedContext);

        if (Object.keys(nestedResult.additions).length > 0) {
          result.additions[key] = nestedResult.additions;
        }

        if (Object.keys(nestedResult.deletions).length > 0) {
          result.deletions[key] = nestedResult.deletions;
        }

        if (Object.keys(nestedResult.updates).length > 0) {
          result.updates[key] = nestedResult.updates;
        }
      } else if (Array.isArray(valueA) && Array.isArray(valueB)) {
        // Array comparison
        if (
          !compareArrays(
            valueA,
            valueB,
            {
              ...context,
              path: [...context.path, key],
            },
            internalDiff
          )
        ) {
          result.updates[key] = { from: valueA, to: valueB };
        }
      } else {
        // Primitive comparison
        if (
          !comparePrimitives(valueA, valueB, context.options.enableTypeCoercion)
        ) {
          result.updates[key] = { from: valueA, to: valueB };
        }
      }
    }
  }

  return result;
}

/**
 * Main diff function that compares two objects
 * @param objectA The first object to compare
 * @param objectB The second object to compare
 * @param options Optional configuration for the diff operation
 * @returns Object containing additions, deletions, and updates
 */
export function diff(
  objectA: any,
  objectB: any,
  options: DiffOptions = {}
): DiffResult {
  // Merge options with defaults
  const mergedOptions: Required<DiffOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Create initial context
  const context: ComparisonContext = {
    path: [],
    depth: 0,
    options: mergedOptions,
  };

  return internalDiff(objectA, objectB, context);
}
