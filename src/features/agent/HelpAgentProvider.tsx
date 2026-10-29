import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import type { ProposedAction } from '@/agent/actions/types';
import { demoEngine } from '@/agent/demo/demoEngine';
import { LiveUnavailableError } from '@/agent/live/transport';
import { findScenario, isScenarioId, type ScenarioId } from '@/agent/demo/scenarios';
import type { DiagnosticResult } from '@/agent/diagnostics/types';
import type { AgentContext, AgentInput, AgentMode, AgentRequest, ImageAttachment } from '@/agent/protocol';
import type { CaseDraftInput } from '@/services/ea-api/types';
import { engineFor, resolveAgentMode } from './agentEngine';
import { HelpAgentContext, introMessage, loadAgentContext, type HelpAgentApi } from './agentContext';
import { conversationReducer, initialConversationState, playerHistory } from './conversation';

const SCENARIO_QUERY_PARAM = 'scenario';

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
  const [mode, setMode] = useState<AgentMode>('demo');
  // Read by `run` without re-creating every callback when the mode changes.
  const modeRef = useRef<AgentMode>('demo');
  const switchMode = useCallback((next: AgentMode) => {
    modeRef.current = next;
    setMode(next);
  }, []);
  const contextPromise = useRef<Promise<AgentContext> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const diagnosticsRef = useRef<DiagnosticResult[]>([]);
  const itemsRef = useRef(state.items);
  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  /** Loads account context (and picks live or demo) once, then greets the player before the first reply. */
  const ensureContext = useCallback((): Promise<AgentContext> => {
    if (!contextPromise.current) {
      dispatch({
        type: 'agent_event',
        event: { type: 'status', id: nextLocalId('ctx'), text: 'Loading your games and account…' },
      });
      contextPromise.current = Promise.all([loadAgentContext(), resolveAgentMode()]).then(([loaded, resolved]) => {
        switchMode(resolved);
        setContext(loaded);
        dispatch({
          type: 'agent_event',
          event: { type: 'message', id: nextLocalId('intro'), text: introMessage(loaded), level: 'L0' },
        });
        return loaded;
      });
    }
    return contextPromise.current;
  }, [switchMode]);

  const run = useCallback(
    async (input: AgentInput, playerText?: string) => {
      // Captured before any await: the player's new message is not rendered yet.
      const history = [...playerHistory(itemsRef.current), ...(playerText ? [playerText] : [])];
      const diagnostics = [...diagnosticsRef.current];
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      dispatch({ type: 'run_started' });
      try {
        const loaded = await ensureContext();
        const request: AgentRequest = {
          conversationId: 'help-agent-conversation',
          input,
          context: loaded,
          history,
          diagnostics,
        };
        // Both engines run confirmed L2 actions here in the browser, never through the model.
        try {
          for await (const event of engineFor(modeRef.current).run(request, controller.signal)) {
            dispatch({ type: 'agent_event', event });
          }
        } catch (error) {
          if (!(error instanceof LiveUnavailableError)) throw error;
          // Over a limit, key missing or upstream down: continue in demo mode for the session.
          switchMode('demo');
          if (error.partial) {
            dispatch({
              type: 'agent_event',
              event: {
                type: 'error',
                id: nextLocalId('err'),
                message:
                  'The live agent stopped responding, so I switched to demo mode. Try again, or talk to a person.',
              },
            });
          } else {
            for await (const event of demoEngine.run(request, controller.signal)) {
              dispatch({ type: 'agent_event', event });
            }
          }
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
    [ensureContext, switchMode],
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
    (text: string, image?: ImageAttachment) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      dispatch({ type: 'user_message', id: nextLocalId('user'), text: trimmed, attachment: image?.name });
      void run({ kind: 'text', text: trimmed, ...(image ? { image } : {}) }, trimmed);
    },
    [run],
  );

  const talkToPerson = useCallback(() => {
    void run({ kind: 'talk_to_person' });
  }, [run]);

  const reportDiagnostic = useCallback(
    (result: DiagnosticResult) => {
      const text = result.outcome === 'resolved' ? 'That fixed it.' : 'None of those steps worked.';
      dispatch({ type: 'user_message', id: nextLocalId('user'), text });
      void run({ kind: 'diagnostic_result', result }, text);
      // Recorded after the run captured its inputs, so this result isn't counted twice.
      diagnosticsRef.current = [...diagnosticsRef.current, result];
    },
    [run],
  );

  const submitCase = useCallback(
    (draft: CaseDraftInput) => {
      const text = 'Send my case to an advisor.';
      dispatch({ type: 'user_message', id: nextLocalId('user'), text });
      void run({ kind: 'submit_case', draft }, text);
    },
    [run],
  );

  const confirmAction = useCallback(
    (action: ProposedAction, label: string) => {
      dispatch({ type: 'user_message', id: nextLocalId('user'), text: label });
      void run({ kind: 'confirm_action', action }, label);
    },
    [run],
  );

  const reportIdentityVerified = useCallback(
    (sessionId: string) => {
      const text = "I've finished the identity checks.";
      dispatch({ type: 'user_message', id: nextLocalId('user'), text });
      void run({ kind: 'identity_verified', sessionId }, text);
    },
    [run],
  );

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
    () => ({
      state,
      mode,
      context,
      open,
      close,
      send,
      talkToPerson,
      reportDiagnostic,
      submitCase,
      confirmAction,
      reportIdentityVerified,
      prefill,
    }),
    [
      state,
      mode,
      context,
      open,
      close,
      send,
      talkToPerson,
      reportDiagnostic,
      submitCase,
      confirmAction,
      reportIdentityVerified,
      prefill,
    ],
  );

  return <HelpAgentContext.Provider value={api}>{children}</HelpAgentContext.Provider>;
};
