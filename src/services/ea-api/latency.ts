let latencyMs = 350;

/** Simulated network latency for mock APIs. Tests set this to 0. */
export const setApiLatency = (ms: number): void => {
  latencyMs = ms;
};

export const simulateLatency = (): Promise<void> =>
  latencyMs === 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, latencyMs));
