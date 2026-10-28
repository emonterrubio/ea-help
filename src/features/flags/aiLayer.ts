import { useSyncExternalStore } from 'react';
import { createExternalStore, safeStorage } from '@/lib/externalStore';

export const AI_LAYER_STORAGE_KEY = 'ea-help:ai-layer';
export const AI_LAYER_QUERY_PARAM = 'ai';

const parseFlag = (value: string | null): boolean | null => {
  if (value === 'on') return true;
  if (value === 'off') return false;
  return null;
};

/**
 * Initial state: `?ai=on|off` wins (and is remembered), then the stored choice,
 * then on. The AI layer is the default experience; `off` shows the untouched v1.
 */
export const resolveInitialAiLayer = (search: string): boolean => {
  const fromQuery = parseFlag(new URLSearchParams(search).get(AI_LAYER_QUERY_PARAM));
  if (fromQuery !== null) {
    safeStorage.set(AI_LAYER_STORAGE_KEY, fromQuery ? 'on' : 'off');
    return fromQuery;
  }
  return parseFlag(safeStorage.get(AI_LAYER_STORAGE_KEY)) ?? true;
};

const aiLayerStore = createExternalStore(resolveInitialAiLayer(window.location.search));

export const setAiLayerEnabled = (enabled: boolean): void => {
  safeStorage.set(AI_LAYER_STORAGE_KEY, enabled ? 'on' : 'off');
  aiLayerStore.set(enabled);
};

/** Whether the v3 AI layer is enabled (feature flag). */
export const useAiLayer = (): boolean => useSyncExternalStore(aiLayerStore.subscribe, aiLayerStore.getSnapshot);
