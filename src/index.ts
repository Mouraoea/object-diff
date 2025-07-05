/**
 * object-diff - A high-performance object diffing library for MongoDB-like objects
 * 
 * This library compares two objects and returns:
 * - additions: properties that exist in object B but not in object A
 * - deletions: properties that exist in object A but not in object B  
 * - updates: properties that exist in both but have different values
 */

export { diff } from './diff.js';
export type { DiffOptions, DiffResult } from './types.js';

// Re-export utility functions for advanced usage
export { coerceValues, canCoerceToNumber, canCoerceToBoolean, canCoerceToDate } from './utils/coercion.js';
export { 
  shouldIgnoreProperty, 
  comparePrimitives, 
  compareArrays, 
  setNestedValue, 
  getNestedValue, 
  isPlainObject 
} from './utils/comparison.js'; 