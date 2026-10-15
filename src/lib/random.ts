/** Returns a random element of a non-empty array. */
export const pickRandom = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)] as T;

/** Returns `count` distinct random indices in `[0, length)` (capped at `length`). */
export const pickUniqueIndices = (length: number, count: number): number[] => {
  const target = Math.min(count, length);
  const picked = new Set<number>();
  while (picked.size < target) {
    picked.add(Math.floor(Math.random() * length));
  }
  return [...picked];
};
