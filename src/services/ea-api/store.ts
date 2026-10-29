import { useSyncExternalStore } from 'react';
import { createExternalStore, safeStorage } from '@/lib/externalStore';
import type { AgentCase } from './cases';
import type { ActionReceipt, Grant, IdentityFactor, IncidentStatus } from './types';

/** Mutable demo state layered on top of the static fixtures. */
export interface DemoState {
  version: 1;
  grants: Grant[];
  followedIncidentIds: string[];
  /** Live status changes on top of the incident fixtures (advanced from the prototype dock). */
  incidentStatus: Record<string, IncidentStatus>;
  /** Cases drafted by the Help Agent and sent by the player (newest first). */
  createdCases: AgentCase[];
  /** Receipts for every change applied after a player tap (L2), oldest first. */
  receipts: ActionReceipt[];
  /** Identity checks passed per recovery session; cleared once a reset is applied. */
  verifiedFactors: Record<string, IdentityFactor[]>;
}

export const DEMO_STATE_STORAGE_KEY = 'ea-help:demo-state';

export const emptyDemoState = (): DemoState => ({
  version: 1,
  grants: [],
  followedIncidentIds: [],
  incidentStatus: {},
  createdCases: [],
  receipts: [],
  verifiedFactors: {},
});

type LaterFields = 'incidentStatus' | 'createdCases' | 'receipts' | 'verifiedFactors';
type StoredDemoState = Omit<DemoState, LaterFields> & Partial<Pick<DemoState, LaterFields>>;

const isStoredDemoState = (value: unknown): value is StoredDemoState =>
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
    // Fields added after a state was saved are filled with their defaults.
    return isStoredDemoState(parsed) ? { ...emptyDemoState(), ...parsed } : emptyDemoState();
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
