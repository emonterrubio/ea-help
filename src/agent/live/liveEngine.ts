import { DEMO_RECOVERY_SESSIONS } from '@/services/ea-api/security';
import { runConfirmedAction } from '../actions/confirm';
import { detectSentiment } from '../casework';
import { routeIntent } from '../demo/router';
import { findScenario, type ScenarioId } from '../demo/scenarios';
import { nextEventId, statusEvent } from '../pacing';
import { isToolName, levelForTool, maxLevel, type AutonomyLevel } from '../policy/autonomy';
import type { AgentEngine, AgentEvent, AgentInput, AgentRequest, ImageAttachment } from '../protocol';
import { CitationRegistry, extractCitations } from './citations';
import { TOOL_HANDLERS, type ToolContext, type ToolOutcome } from './tools';
import { LiveUnavailableError, type Transport, type WireBlock, type WireMessage } from './transport';

/*
 * Live engine: Claude decides what to say and which tool to call; the browser runs the
 * tools and renders the same AgentEvents as the demo. Card interactions (troubleshooting
 * results, case sending, identity checks, confirmed actions) are not model decisions, so
 * they run through the same deterministic flows as the demo, and the model is told what
 * happened with an [App event] note.
 */

/** Model turns per player message before the agent gives up and offers a person. */
const MAX_MODEL_ROUNDS = 6;
/** Server-side limit per text block (api/agent.ts LIMITS.maxTextChars). */
const MAX_BLOCK_CHARS = 3900;

interface ConversationState {
  transcript: WireMessage[];
  citations: CitationRegistry;
  scenarioId?: ScenarioId;
}

const clip = (text: string): string =>
  text.length > MAX_BLOCK_CHARS ? `${text.slice(0, MAX_BLOCK_CHARS - 1)}…` : text;

const appNote = (text: string): WireMessage => ({ role: 'user', content: [{ type: 'text', text: clip(text) }] });

/** What the model needs to know about a card interaction the app handled. */
const describeAppEvent = (input: AgentInput, events: readonly AgentEvent[]): string => {
  const receipt = events.find((event) => event.type === 'card' && event.card.type === 'receipt');
  const handedOff = events.some((event) => event.type === 'handoff');
  switch (input.kind) {
    case 'confirm_action':
      return receipt && receipt.type === 'card' && receipt.card.type === 'receipt'
        ? `[App event] The player confirmed "${input.action.kind}". EA applied it and showed a receipt (reference ${receipt.card.referenceId}).`
        : `[App event] The player confirmed "${input.action.kind}", but EA's rules engine rejected it and drafted a case instead. Nothing changed.`;
    case 'diagnostic_result': {
      const fix = input.result.log.find((entry) => entry.outcome === 'done');
      return input.result.outcome === 'resolved'
        ? `[App event] Guided troubleshooting finished. "${fix?.title ?? 'A step'}" fixed it.`
        : `[App event] Guided troubleshooting finished. None of the ${input.result.log.length} steps worked, so the app drafted a case with the log for the player to review and send.`;
    }
    case 'identity_verified':
      return handedOff
        ? '[App event] The identity checks did not pass the risk rules, so the app handed the player to an advisor. Nothing changed.'
        : '[App event] The player passed the identity checks. The app showed a password reset preview for them to confirm.';
    case 'submit_case':
      return '[App event] The player sent the drafted case. An advisor now has the conversation.';
    case 'talk_to_person':
      return '[App event] The player tapped "Talk to a person". The app created a case and connected them with an advisor.';
    case 'text':
      return `[App event] Safety rules connected the player with an advisor after this message: "${input.text}"`;
    case 'scenario':
      return '[App event] The app connected the player with an advisor.';
  }
};

const playerContent = (text: string, image?: ImageAttachment): WireBlock[] => [
  // Images go before the text that refers to them.
  ...(image
    ? [{ type: 'image' as const, source: { type: 'base64' as const, media_type: image.mediaType, data: image.data } }]
    : []),
  { type: 'text', text: clip(text) },
];

const isToolUse = (block: WireBlock): block is Extract<WireBlock, { type: 'tool_use' }> => block.type === 'tool_use';

export interface LiveEngineOptions {
  transport: Transport;
  /** Runs the deterministic flows (card interactions and safety handoffs). */
  fallback: AgentEngine;
  now?: () => Date;
}

export const createLiveEngine = ({ transport, fallback, now = () => new Date() }: LiveEngineOptions): AgentEngine => {
  const conversations = new Map<string, ConversationState>();

  const conversationFor = (id: string): ConversationState => {
    const existing = conversations.get(id);
    if (existing) return existing;
    const created: ConversationState = { transcript: [], citations: new CitationRegistry() };
    conversations.set(id, created);
    return created;
  };

  /** Which demo sign-in attempt is being recovered: the risky one if the player described a takeover. */
  const signInAttempt = (state: ConversationState, history: readonly string[]) => () =>
    state.scenarioId === 'account-recovery-risky' ||
    history.some((text) => routeIntent(text) === 'account-recovery-risky')
      ? DEMO_RECOVERY_SESSIONS.newDevice
      : DEMO_RECOVERY_SESSIONS.usualDevice;

  /** Card interactions and safety triggers: the deterministic flow runs, then the model is told. */
  async function* runAppFlow(
    request: AgentRequest,
    state: ConversationState,
    signal: AbortSignal,
  ): AsyncGenerator<AgentEvent> {
    const events: AgentEvent[] = [];
    const source = request.input.kind === 'confirm_action' ? runConfirmedAction : fallback.run;
    for await (const event of source(request, signal)) {
      events.push(event);
      yield event;
    }
    state.transcript = [...state.transcript, appNote(describeAppEvent(request.input, events))];
  }

  async function* runTool(
    block: Extract<WireBlock, { type: 'tool_use' }>,
    ctx: ToolContext,
  ): AsyncGenerator<AgentEvent, ToolOutcome & { level: AutonomyLevel }> {
    if (!isToolName(block.name)) {
      return { output: { error: `Unknown tool ${block.name}` }, isError: true, level: 'L0' };
    }
    let level = levelForTool(block.name);
    const steps = TOOL_HANDLERS[block.name](block.input, ctx);
    let step = await steps.next();
    while (!step.done) {
      // A tool that ends in a handoff (high-risk recovery) reached L3.
      if (step.value.type === 'handoff') level = 'L3';
      yield step.value;
      step = await steps.next();
    }
    return { ...step.value, level };
  }

  async function* run(request: AgentRequest, signal: AbortSignal): AsyncGenerator<AgentEvent> {
    const state = conversationFor(request.conversationId);
    const { input } = request;
    if (input.kind !== 'text' && input.kind !== 'scenario') {
      yield* runAppFlow(request, state, signal);
      return;
    }

    if (input.kind === 'scenario') state.scenarioId = input.scenarioId;
    const text = input.kind === 'text' ? input.text : (findScenario(input.scenarioId)?.prompt ?? '');
    // Safety triggers never wait for the model (PRD: sentiment and safety go straight to a person).
    if (routeIntent(text) === 'escalate' || detectSentiment([text]) === 'distressed') {
      yield* runAppFlow({ ...request, input: { kind: 'text', text } }, state, signal);
      return;
    }

    const working: WireMessage[] = [
      ...state.transcript,
      { role: 'user', content: playerContent(text, input.kind === 'text' ? input.image : undefined) },
    ];
    const ctx: ToolContext = {
      request,
      signal,
      citations: state.citations,
      signInAttempt: signInAttempt(state, request.history),
      now,
    };
    let level: AutonomyLevel = 'L0';
    let shownSomething = false;

    yield statusEvent('Understanding your request…');
    for (let round = 0; round < MAX_MODEL_ROUNDS; round += 1) {
      let turn;
      try {
        turn = await transport({ messages: working, context: request.context }, signal);
      } catch (error) {
        if (error instanceof LiveUnavailableError && shownSomething) {
          throw new LiveUnavailableError(error.reason, true);
        }
        throw error;
      }

      if (turn.stopReason === 'refusal') {
        // The partial turn is never kept, so the conversation stays valid for the next message.
        yield {
          type: 'message',
          id: nextEventId(),
          level: 'L0',
          text: 'I can\'t help with that one here. Tap "Talk to a person" and an advisor will pick it up.',
        } satisfies AgentEvent;
        yield { type: 'done' };
        return;
      }

      const toolUses = turn.stopReason === 'tool_use' ? turn.content.filter(isToolUse) : [];
      // A tool call cut off by max_tokens is never run (or kept).
      const kept = turn.stopReason === 'tool_use' ? turn.content : turn.content.filter((block) => !isToolUse(block));
      if (kept.length > 0) working.push({ role: 'assistant', content: kept });

      const turnLevel = toolUses.reduce<AutonomyLevel>(
        (highest, block) => (isToolName(block.name) ? maxLevel(highest, levelForTool(block.name)) : highest),
        level,
      );
      const said = turn.content
        .flatMap((block) => (block.type === 'text' ? [block.text] : []))
        .join('\n\n')
        .trim();
      if (said) {
        const { text: clean, citations } = extractCitations(said, state.citations);
        if (clean) {
          shownSomething = true;
          yield {
            type: 'message',
            id: nextEventId(),
            text: clean,
            level: turnLevel,
            ...(citations.length > 0 ? { citations } : {}),
          } satisfies AgentEvent;
        }
      }

      if (toolUses.length === 0) {
        state.transcript = working;
        yield { type: 'done' };
        return;
      }

      const results: WireBlock[] = [];
      for (const block of toolUses) {
        const outcome = yield* runTool(block, ctx);
        shownSomething = true;
        level = maxLevel(level, outcome.level);
        results.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: clip(JSON.stringify(outcome.output)),
          ...(outcome.isError ? { is_error: true } : {}),
        });
      }
      working.push({ role: 'user', content: results });
    }

    state.transcript = working;
    yield {
      type: 'message',
      id: nextEventId(),
      level: 'L0',
      text: 'I\'m not getting anywhere with this, so a person is the faster route. Tap "Talk to a person" and I\'ll pass everything along.',
    } satisfies AgentEvent;
    yield { type: 'done' };
  }

  return { mode: 'live', run };
};
