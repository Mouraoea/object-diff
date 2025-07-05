import { diff } from '../src/index.js';

describe('db-diff', () => {
  describe('Basic functionality', () => {
    test('should return empty result for identical objects', () => {
      const objA = { name: 'John', age: 30 };
      const objB = { name: 'John', age: 30 };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });

    test('should detect additions', () => {
      const objA = { name: 'John' };
      const objB = { name: 'John', age: 30 };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({ age: 30 });
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });

    test('should detect deletions', () => {
      const objA = { name: 'John', age: 30 };
      const objB = { name: 'John' };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({ age: 30 });
      expect(result.updates).toEqual({});
    });

    test('should detect updates', () => {
      const objA = { name: 'John', age: 30 };
      const objB = { name: 'John', age: 31 };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({ age: { from: 30, to: 31 } });
    });
  });

  describe('Nested objects', () => {
    test('should handle nested object additions', () => {
      const objA = { user: { name: 'John' } };
      const objB = {
        user: { name: 'John', profile: { email: 'john@example.com' } },
      };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({
        user: { profile: { email: 'john@example.com' } },
      });
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });

    test('should handle nested object deletions', () => {
      const objA = {
        user: { name: 'John', profile: { email: 'john@example.com' } },
      };
      const objB = { user: { name: 'John' } };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({
        user: { profile: { email: 'john@example.com' } },
      });
      expect(result.updates).toEqual({});
    });

    test('should handle nested object updates', () => {
      const objA = { user: { name: 'John', age: 30 } };
      const objB = { user: { name: 'John', age: 31 } };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({
        user: { age: { from: 30, to: 31 } },
      });
    });
  });

  describe('Arrays', () => {
    test('should handle array additions', () => {
      const objA = { tags: ['javascript'] };
      const objB = { tags: ['javascript', 'typescript'] };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({
        tags: { from: ['javascript'], to: ['javascript', 'typescript'] },
      });
    });

    test('should handle array order changes', () => {
      const objA = { tags: ['javascript', 'typescript'] };
      const objB = { tags: ['typescript', 'javascript'] };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({
        tags: {
          from: ['javascript', 'typescript'],
          to: ['typescript', 'javascript'],
        },
      });
    });

    test('should handle array with order not mattering', () => {
      const objA = { tags: ['javascript', 'typescript'] };
      const objB = { tags: ['typescript', 'javascript'] };

      const result = diff(objA, objB, { arrayOrderMatters: false });

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });
  });

  describe('Type coercion', () => {
    test('should handle string vs number coercion', () => {
      const objA = { age: 30 };
      const objB = { age: '30' };

      const result = diff(objA, objB, { enableTypeCoercion: true });

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });

    test('should not coerce when disabled', () => {
      const objA = { age: 30 };
      const objB = { age: '30' };

      const result = diff(objA, objB, { enableTypeCoercion: false });

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({ age: { from: 30, to: '30' } });
    });

    test('should handle boolean vs string coercion', () => {
      const objA = { active: true };
      const objB = { active: 'true' };

      const result = diff(objA, objB, { enableTypeCoercion: true });

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });

    test('should handle Date vs string coercion', () => {
      const date = new Date('2023-01-01');
      const objA = { createdAt: date };
      const objB = { createdAt: '2023-01-01T00:00:00.000Z' };

      const result = diff(objA, objB, { enableTypeCoercion: true });

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });
  });

  describe('Ignored properties', () => {
    test('should ignore specified properties', () => {
      const objA = { name: 'John', age: 30, _id: '123' };
      const objB = { name: 'John', age: 31, _id: '456' };

      const result = diff(objA, objB, { ignoreProperties: ['_id'] });

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({ age: { from: 30, to: 31 } });
    });

    test('should ignore nested properties', () => {
      const objA = { user: { name: 'John', _id: '123' } };
      const objB = { user: { name: 'John', _id: '456' } };

      const result = diff(objA, objB, { ignoreProperties: ['user._id'] });

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });

    test('should ignore properties with wildcards', () => {
      const objA = { user: { name: 'John', _id: '123', _version: 1 } };
      const objB = { user: { name: 'John', _id: '456', _version: 2 } };

      const result = diff(objA, objB, { ignoreProperties: ['user._*'] });

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });
  });

  describe('Edge cases', () => {
    test('should handle null values', () => {
      const objA = { name: 'John', age: null };
      const objB = { name: 'John', age: 30 };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({ age: { from: null, to: 30 } });
    });

    test('should handle undefined values', () => {
      const objA = { name: 'John', age: undefined };
      const objB = { name: 'John', age: 30 };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({ age: { from: undefined, to: 30 } });
    });

    test('should handle empty objects', () => {
      const objA = {};
      const objB = {};

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });

    test('should handle null vs object', () => {
      const objA = null;
      const objB = { name: 'John' };

      const result = diff(objA, objB);

      expect(result.additions).toEqual({ name: 'John' });
      expect(result.deletions).toEqual({});
      expect(result.updates).toEqual({});
    });

    test('should handle object vs null', () => {
      const objA = { name: 'John' };
      const objB = null;

      const result = diff(objA, objB);

      expect(result.additions).toEqual({});
      expect(result.deletions).toEqual({ name: 'John' });
      expect(result.updates).toEqual({});
    });
  });

  describe('Performance considerations', () => {
    test('should handle large objects efficiently', () => {
      const objA: Record<string, any> = {};
      const objB: Record<string, any> = {};

      // Create objects with 50 properties
      for (let i = 0; i < 50; i++) {
        objA[`prop${i}`] = i;
        objB[`prop${i}`] = i;
      }

      // Change one property
      objB.prop25 = 100;

      const start = performance.now();
      const result = diff(objA, objB);
      const end = performance.now();

      expect(result.updates).toEqual({ prop25: { from: 25, to: 100 } });
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });

    test('should respect max depth limit', () => {
      let objA: any = { value: 'deep' };
      let objB: any = { value: 'deep' };

      // Create deeply nested objects
      for (let i = 0; i < 10; i++) {
        objA = { nested: objA };
        objB = { nested: objB };
      }
      const result = diff(objA, objB, { maxDepth: 3 });

      // Should not crash and should handle the depth limit gracefully
      expect(result).toBeDefined();
    });
  });
});
