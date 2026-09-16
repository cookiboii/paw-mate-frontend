import { describe, expect, it } from 'vitest';
import { percentileNearestRank } from './performance';

describe('percentileNearestRank', () => {
  it('uses the 19th value as P95 for 20 samples', () => {
    const samples = Array.from({ length: 20 }, (_, index) => index + 1);
    expect(percentileNearestRank(samples, 0.95)).toBe(19);
  });

  it('handles empty and single-value samples', () => {
    expect(percentileNearestRank([], 0.95)).toBe(0);
    expect(percentileNearestRank([42], 0.95)).toBe(42);
  });
});
