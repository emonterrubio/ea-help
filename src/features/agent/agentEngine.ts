import { demoEngine } from '@/agent/demo/demoEngine';
import { createLiveEngine } from '@/agent/live/liveEngine';
import { checkLiveStatus, fetchTransport } from '@/agent/live/transport';
import type { AgentEngine, AgentMode } from '@/agent/protocol';
import { safeStorage } from '@/lib/externalStore';

export const AGENT_ENGINE_STORAGE_KEY = 'ea-help:agent-engine';
export const AGENT_ENGINE_QUERY_PARAM = 'agent';

/** `auto` uses live Claude when the server allows it; `demo` always plays the scripted engine. */
export type AgentEnginePreference = 'auto' | 'demo';

const parsePreference = (value: string | null): AgentEnginePreference | null =>
  value === 'auto' || value === 'demo' ? value : null;

/** `?agent=demo|auto` wins (and is remembered), then the stored choice, then auto. */
export const resolveInitialPreference = (search: string): AgentEnginePreference => {
  const fromQuery = parsePreference(new URLSearchParams(search).get(AGENT_ENGINE_QUERY_PARAM));
  if (fromQuery) {
    safeStorage.set(AGENT_ENGINE_STORAGE_KEY, fromQuery);
    return fromQuery;
  }
  return parsePreference(safeStorage.get(AGENT_ENGINE_STORAGE_KEY)) ?? 'auto';
};

let preference = resolveInitialPreference(window.location.search);

export const setAgentEnginePreference = (next: AgentEnginePreference): void => {
  preference = next;
  safeStorage.set(AGENT_ENGINE_STORAGE_KEY, next);
};

/** Live mode only when the visitor hasn't forced the demo and the server says live is on. */
export const resolveAgentMode = async (): Promise<AgentMode> =>
  preference === 'auto' && (await checkLiveStatus()) ? 'live' : 'demo';

const liveEngine = createLiveEngine({ transport: fetchTransport, fallback: demoEngine });

export const engineFor = (mode: AgentMode): AgentEngine => (mode === 'live' ? liveEngine : demoEngine);
