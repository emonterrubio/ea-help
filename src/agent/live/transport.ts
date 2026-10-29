import type { AgentContext } from '../protocol';

/*
 * Wire format for /api/agent: the Messages API content blocks the live engine sends and
 * receives. Kept minimal on purpose so the SDK never ships to the browser.
 */

export type WireBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean }
  | { type: 'thinking'; thinking: string; signature: string }
  | { type: 'redacted_thinking'; data: string };

export interface WireMessage {
  role: 'user' | 'assistant';
  content: WireBlock[];
}

export interface ModelTurn {
  content: WireBlock[];
  stopReason: string | null;
}

export interface TurnBody {
  messages: WireMessage[];
  context: AgentContext;
}

/** One model turn. The browser implementation posts to /api/agent; tests pass a fake. */
export type Transport = (body: TurnBody, signal: AbortSignal) => Promise<ModelTurn>;

/**
 * Live mode can't continue: no key, the kill switch, a rate or spend limit, or an upstream
 * failure. The provider switches to the demo engine for the rest of the session.
 */
export class LiveUnavailableError extends Error {
  constructor(
    readonly reason: string,
    /** True when some of this reply was already shown, so it can't simply be replayed in demo mode. */
    readonly partial = false,
  ) {
    super(`Live agent unavailable: ${reason}`);
    this.name = 'LiveUnavailableError';
  }
}

export const AGENT_ENDPOINT = '/api/agent';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isWireBlock = (value: unknown): value is WireBlock =>
  isRecord(value) &&
  ((value.type === 'text' && typeof value.text === 'string') ||
    (value.type === 'tool_use' &&
      typeof value.id === 'string' &&
      typeof value.name === 'string' &&
      isRecord(value.input)) ||
    (value.type === 'thinking' && typeof value.thinking === 'string' && typeof value.signature === 'string') ||
    (value.type === 'redacted_thinking' && typeof value.data === 'string'));

const reasonFrom = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    return isRecord(body) && typeof body.reason === 'string' ? body.reason : `http_${response.status}`;
  } catch {
    return `http_${response.status}`;
  }
};

export const fetchTransport: Transport = async (body, signal) => {
  let response: Response;
  try {
    response = await fetch(AGENT_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new LiveUnavailableError('network');
  }
  if (!response.ok) throw new LiveUnavailableError(await reasonFrom(response));
  const data: unknown = await response.json();
  if (!isRecord(data) || !Array.isArray(data.content) || !data.content.every(isWireBlock)) {
    throw new LiveUnavailableError('bad_response');
  }
  return { content: data.content, stopReason: typeof data.stopReason === 'string' ? data.stopReason : null };
};

const STATUS_TIMEOUT_MS = 2500;

/** Asks the server whether live mode is on. Anything but a clear yes means demo mode. */
export const checkLiveStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(AGENT_ENDPOINT, { signal: AbortSignal.timeout(STATUS_TIMEOUT_MS) });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
    const body: unknown = await response.json();
    return isRecord(body) && body.live === true;
  } catch {
    return false;
  }
};
