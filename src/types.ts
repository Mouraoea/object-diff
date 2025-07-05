/**
 * Options for configuring the diff behavior
 */
export interface DiffOptions {
  /**
   * Array of property names to ignore during comparison
   * Can be nested properties using dot notation (e.g., "user.profile.email")
   */
  ignoreProperties?: string[];
  
  /**
   * Whether to enable type coercion for primitive values
   * Default: true
   */
  enableTypeCoercion?: boolean;
  
  /**
   * Whether array order matters during comparison
   * Default: true
   */
  arrayOrderMatters?: boolean;
  
  /**
   * Maximum depth for nested object comparison
   * Default: 5
   */
  maxDepth?: number;
}

/**
 * Result of the diff operation
 */
export interface DiffResult {
  /**
   * Properties that exist in object B but not in object A
   */
  additions: Record<string, any>;
  
  /**
   * Properties that exist in object A but not in object B
   */
  deletions: Record<string, any>;
  
  /**
   * Properties that exist in both objects but have different values
   */
  updates: Record<string, any>;
}

/**
 * Internal type for tracking comparison context
 */
export interface ComparisonContext {
  path: string[];
  depth: number;
  options: Required<DiffOptions>;
}

/**
 * Type for the internal diff function
 */
export type InternalDiffFunction = (
  objA: any,
  objB: any,
  context: ComparisonContext
) => DiffResult; 