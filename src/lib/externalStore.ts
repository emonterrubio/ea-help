export interface ExternalStore<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: (next: T | ((current: T) => T)) => void;
}

/** Minimal observable value for `useSyncExternalStore`. */
export const createExternalStore = <T>(initial: T): ExternalStore<T> => {
  let value = initial;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => value,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (next) => {
      value = typeof next === 'function' ? (next as (current: T) => T)(value) : next;
      listeners.forEach((listener) => listener());
    },
  };
};

/** localStorage access that never throws (private mode, blocked storage, SSR). */
export const safeStorage = {
  get: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage unavailable: the value simply won't persist.
    }
  },
  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  },
};
