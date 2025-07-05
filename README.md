# object-diff

[![CI](https://github.com/Mouraoea/object-diff/workflows/CI/badge.svg)](https://github.com/Mouraoea/object-diff/actions)
[![npm version](https://badge.fury.io/js/object-diff.svg)](https://badge.fury.io/js/object-diff)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A high-performance object diffing library for MongoDB-like objects. This library compares two objects and returns detailed information about additions, deletions, and updates.

## Features

- **High Performance**: Optimized for speed, handling up to 50,000 calls with objects containing 50-60 properties
- **Deep Nesting**: Supports up to 10 levels of nested object comparison (configurable)
- **Type Coercion**: Handles type differences like `"1"` vs `1`, `true` vs `"true"`, `Date` vs string
- **Flexible Ignoring**: Ignore specific properties or use wildcards (e.g., `user._*`)
- **Array Support**: Configurable array order sensitivity
- **TypeScript**: Full TypeScript support with comprehensive type definitions
- **ES Modules**: Modern ES module support

## Installation

```bash
npm install object-diff
```

## Quick Start

```typescript
import { diff } from 'object-diff';

const objectA = {
  name: 'John',
  age: 30,
  profile: {
    email: 'john@example.com',
    active: true,
  },
};

const objectB = {
  name: 'John',
  age: 31,
  profile: {
    email: 'john@example.com',
    active: 'true',
    phone: '+1234567890',
  },
};

const result = diff(objectA, objectB);

console.log(result);
// Output:
// {
//   additions: {
//     profile: { phone: '+1234567890' }
//   },
//   deletions: {},
//   updates: {
//     age: { from: 30, to: 31 },
//     profile: { active: { from: true, to: 'true' } }
//   }
// }
```

## API Reference

### `diff(objectA, objectB, options?)`

Compares two objects and returns the differences.

#### Parameters

- `objectA` (any): The first object to compare
- `objectB` (any): The second object to compare
- `options` (DiffOptions, optional): Configuration options

#### Returns

- `DiffResult`: Object containing additions, deletions, and updates

### `DiffOptions`

```typescript
interface DiffOptions {
  ignoreProperties?: string[]; // Properties to ignore during comparison
  enableTypeCoercion?: boolean; // Enable type coercion (default: true)
  arrayOrderMatters?: boolean; // Whether array order matters (default: true)
  maxDepth?: number; // Maximum nesting depth (default: 10)
}
```

### `DiffResult`

```typescript
interface DiffResult {
  additions: Record<string, any>; // Properties in B but not in A
  deletions: Record<string, any>; // Properties in A but not in B
  updates: Record<string, any>; // Properties in both but with different values
}
```

## Usage Examples

### Basic Comparison

```typescript
import { diff } from 'object-diff';

const result = diff(
  { name: 'John', age: 30 },
  { name: 'John', age: 31, city: 'NYC' }
);

// result.additions = { city: 'NYC' }
// result.deletions = {}
// result.updates = { age: { from: 30, to: 31 } }
```

### Ignoring Properties

```typescript
const result = diff(objectA, objectB, {
  ignoreProperties: ['_id', 'createdAt', 'user._*'],
});
```

### Disabling Type Coercion

```typescript
const result = diff(
  { age: 30, active: true },
  { age: '30', active: 'true' },
  { enableTypeCoercion: false }
);

// Will detect differences due to type mismatch
```

### Array Order Sensitivity

```typescript
// Order matters (default)
const result1 = diff({ tags: ['js', 'ts'] }, { tags: ['ts', 'js'] });
// result1.updates = { tags: { from: ['js', 'ts'], to: ['ts', 'js'] } }

// Order doesn't matter
const result2 = diff(
  { tags: ['js', 'ts'] },
  { tags: ['ts', 'js'] },
  { arrayOrderMatters: false }
);
// result2.updates = {} (no difference detected)
```

### Nested Object Comparison

```typescript
const result = diff(
  {
    user: {
      name: 'John',
      profile: { email: 'john@example.com' },
    },
  },
  {
    user: {
      name: 'John',
      profile: {
        email: 'john@example.com',
        phone: '+1234567890',
      },
    },
  }
);

// result.additions = {
//   user: { profile: { phone: '+1234567890' } }
// }
```

### Type Coercion Examples

```typescript
// String vs Number
diff({ age: 30 }, { age: '30' });
// No differences detected (type coercion enabled)

// Boolean vs String
diff({ active: true }, { active: 'true' });
// No differences detected

// Date vs String
const date = new Date('2023-01-01');
diff({ createdAt: date }, { createdAt: '2023-01-01T00:00:00.000Z' });
// No differences detected
```

## Performance Considerations

- **Speed Optimized**: Designed for high-throughput scenarios
- **Memory Efficient**: Minimal object creation during comparison
- **Depth Limiting**: Configurable max depth prevents infinite recursion
- **Early Exit**: Stops comparison as soon as differences are found

## Advanced Usage

### Custom Property Ignoring

```typescript
// Ignore specific properties
const result = diff(objA, objB, {
  ignoreProperties: ['_id', 'version', 'metadata'],
});

// Ignore nested properties
const result = diff(objA, objB, {
  ignoreProperties: ['user._id', 'user.profile._*'],
});

// Use wildcards
const result = diff(objA, objB, {
  ignoreProperties: ['*._id', '*.createdAt'],
});
```

### Handling Large Objects

```typescript
// For objects with many properties, consider ignoring frequently changing fields
const result = diff(largeObjectA, largeObjectB, {
  ignoreProperties: ['lastModified', 'checksum', 'cache.*'],
  maxDepth: 3, // Limit depth for performance
});
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:watch
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
```

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request
