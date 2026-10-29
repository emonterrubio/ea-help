import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { setDemoPacing } from '@/agent/demo/demoEngine';
import { setAgentEnginePreference } from '@/features/agent/agentEngine';
import { setAiLayerEnabled } from '@/features/flags/aiLayer';
import { setApiLatency } from '@/services/ea-api/latency';
import { resetDemoState } from '@/services/ea-api/store';

beforeEach(() => {
  setApiLatency(0);
  setDemoPacing(0);
  // Tests never reach /api/agent; live-engine tests use a fake transport.
  setAgentEnginePreference('demo');
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  resetDemoState();
  setAiLayerEnabled(true);
});

// The DOM test environment does not implement scrolling.
window.scrollTo = (() => {}) as typeof window.scrollTo;
