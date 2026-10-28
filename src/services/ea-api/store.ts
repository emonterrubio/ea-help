import { useSyncExternalStore } from 'react';
import { createExternalStore, safeStorage } from '@/lib/externalStore';
import type { Grant } from './types';

/** Mutable demo state layered on top of the static fixtures. */
export interface DemoState {
  version: 1;
  grants: Grant[];
  followedIncidentIds: string[];
}

export const DEMO_STATE_STORAGE_KEY = 'ea-help:demo-state';

export const emptyDemoState = (): DemoState => ({ version: 1, grants: [], followedIncidentIds: [] });

const isDemoState = (value: unknown): value is DemoState =>
  typeof value === 'object' &&
  value !== null &&
  (value as DemoState).version === 1 &&
  Array.isArray((value as DemoState).grants) &&
  Array.isArray((value as DemoState).followedIncidentIds);

const loadDemoState = (): DemoState => {
  const raw = safeStorage.get(DEMO_STATE_STORAGE_KEY);
  if (!raw) return emptyDemoState();
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDemoState(parsed) ? parsed : emptyDemoState();
  } catch {
    return emptyDemoState();
  }
};

const demoStore = createExternalStore<DemoState>(loadDemoState());

export const getDemoState = demoStore.getSnapshot;

/** Applies an update and persists it so receipts survive reloads. */
export const updateDemoState = (update: (state: DemoState) => DemoState): void => {
  demoStore.set(update);
  safeStorage.set(DEMO_STATE_STORAGE_KEY, JSON.stringify(demoStore.getSnapshot()));
};

/** Restores every fixture to its original state (prototype "Reset demo" control). */
export const resetDemoState = (): void => {
  safeStorage.remove(DEMO_STATE_STORAGE_KEY);
  demoStore.set(emptyDemoState());
};

export const useDemoState = (): DemoState => useSyncExternalStore(demoStore.subscribe, demoStore.getSnapshot);
