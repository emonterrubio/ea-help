import type { AgentEvent } from './protocol';

let pacingMs = 600;

/** Delay between scripted events so status lines read as progress. Tests set 0. */
export const setDemoPacing = (ms: number): void => {
  pacingMs = ms;
};

export const pause = (signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    if (pacingMs === 0) return resolve();
    const timer = setTimeout(resolve, pacingMs);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

let eventCounter = 0;
export const nextEventId = (): string => `evt-${(eventCounter += 1)}`;

export const statusEvent = (text: string): AgentEvent => ({ type: 'status', id: nextEventId(), text });
