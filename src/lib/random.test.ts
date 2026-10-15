import { pickRandom, pickUniqueIndices } from './random';

describe('pickUniqueIndices', () => {
  it('returns the requested number of distinct in-range indices', () => {
    const indices = pickUniqueIndices(22, 8);
    expect(indices).toHaveLength(8);
    expect(new Set(indices).size).toBe(8);
    expect(indices.every((i) => i >= 0 && i < 22)).toBe(true);
  });

  it('caps the count at the available length instead of looping forever', () => {
    expect(pickUniqueIndices(3, 8)).toHaveLength(3);
  });
});

describe('pickRandom', () => {
  it('returns an element of the array', () => {
    const items = ['a', 'b', 'c'];
    expect(items).toContain(pickRandom(items));
  });
});
