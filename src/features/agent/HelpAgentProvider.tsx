import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { demoEngine } from '@/agent/demo/demoEngine';
import { findScenario, isScenarioId, type ScenarioId } from '@/agent/demo/scenarios';
import type { AgentContext, AgentInput } from '@/agent/protocol';
import { HelpAgentContext, introMessage, loadAgentContext, type HelpAgentApi } from './agentContext';
import { conversationReducer, initialConversationState, playerHistory } from './conversation';

const SCENARIO_QUERY_PARAM = 'scenario';
const engine = demoEngine;

let idCounter = 0;
const nextLocalId = (prefix: string): string => `${prefix}-${(idCounter += 1)}`;

interface HelpAgentProviderProps {
  /** Mirrors the AI-layer feature flag; the panel closes when it turns off. */
  enabled: boolean;
  children: ReactNode;
}

/** Owns the Help Agent conversation and runs requests through the active engine. */
export const HelpAgentProvider = ({ enabled, children }: HelpAgentProviderProps) => {
  const [state, dispatch] = useReducer(conversationReducer, initialConversationState);
  const [context, setContext] = useState<AgentContext | null>(null);
  const [prefill, setPrefill] = useState('');
  const contextPromise = useRef<Promise<AgentContext> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const itemsRef = useRef(state.items);
  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  /** Loads account context once and greets the player before the first reply. */
  const ensureContext = useCallback((): Promise<AgentContext> => {
    if (!contextPromise.current) {
      dispatch({
        type: 'agent_event',
        event: { type: 'status', id: nextLocalId('ctx'), text: 'Loading your games and account…' },
      });
      contextPromise.current = loadAgentContext().then((loaded) => {
        setContext(loaded);
        dispatch({
          type: 'agent_event',
          event: { type: 'message', id: nextLocalId('intro'), text: introMessage(loaded), level: 'L0' },
        });
        return loaded;
      });
    }
    return contextPromise.current;
  }, []);

  const run = useCallback(
    async (input: AgentInput, playerText?: string) => {
      // Captured before any await: the player's new message is not rendered yet.
      const history = [...playerHistory(itemsRef.current), ...(playerText ? [playerText] : [])];
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      dispatch({ type: 'run_started' });
      try {
        const loaded = await ensureContext();
        const request = {
          conversationId: 'demo-conversation',
          input,
          context: loaded,
          history,
        };
        for await (const event of engine.run(request, controller.signal)) {
          dispatch({ type: 'agent_event', event });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          dispatch({
            type: 'agent_event',
            event: {
              type: 'error',
              id: nextLocalId('err'),
              message:
                error instanceof Error ? error.message : 'Something went wrong. You can talk to a person instead.',
            },
          });
        }
      } finally {
        if (abortRef.current === controller) dispatch({ type: 'run_finished' });
      }
    },
    [ensureContext],
  );

  const open = useCallback(
    (options: { scenarioId?: ScenarioId; prefill?: string } = {}) => {
      dispatch({ type: 'open' });
      setPrefill(options.prefill ?? '');
      void ensureContext();
      const scenario = options.scenarioId ? findScenario(options.scenarioId) : undefined;
      if (scenario) {
        // A scenario plays out as if the player typed its prompt after the greeting.
        void ensureContext().then(() => {
          dispatch({ type: 'user_message', id: nextLocalId('user'), text: scenario.prompt });
          void run({ kind: 'scenario', scenarioId: scenario.id }, scenario.prompt);
        });
      }
    },
    [ensureContext, run],
  );

  const close = useCallback(() => {
    dispatch({ type: 'close' });
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      dispatch({ type: 'user_message', id: nextLocalId('user'), text: trimmed });
      void run({ kind: 'text', text: trimmed }, trimmed);
    },
    [run],
  );

  const talkToPerson = useCallback(() => {
    void run({ kind: 'talk_to_person' });
  }, [run]);

  // Turning the AI layer off closes the panel and stops any running request.
  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort();
      dispatch({ type: 'close' });
    }
  }, [enabled]);

  // Deep links: `?scenario=<id>` opens the agent and runs that scenario once.
  const [searchParams, setSearchParams] = useSearchParams();
  const scenarioParam = searchParams.get(SCENARIO_QUERY_PARAM);
  const handledScenario = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled || !scenarioParam || handledScenario.current === scenarioParam) return;
    handledScenario.current = scenarioParam;
    if (isScenarioId(scenarioParam)) open({ scenarioId: scenarioParam });
    setSearchParams(
      (params) => {
        params.delete(SCENARIO_QUERY_PARAM);
        return params;
      },
      { replace: true },
    );
  }, [enabled, scenarioParam, open, setSearchParams]);

  const api = useMemo<HelpAgentApi>(
    () => ({ state, mode: engine.mode, context, open, close, send, talkToPerson, prefill }),
    [state, context, open, close, send, talkToPerson, prefill],
  );

  return <HelpAgentContext.Provider value={api}>{children}</HelpAgentContext.Provider>;
};
