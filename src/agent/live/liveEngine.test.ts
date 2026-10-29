import { getDemoState } from '@/services/ea-api/store';
import { demoEngine } from '../demo/demoEngine';
import type { AgentEvent, AgentInput, AgentRequest } from '../protocol';
import { createLiveEngine } from './liveEngine';
import { LiveUnavailableError, type ModelTurn, type Transport, type TurnBody, type WireBlock } from './transport';

const context = {
  playerName: 'Tom Cook',
  platform: 'PS5',
  region: 'US',
  ownedGames: [
    { id: '1', title: 'Madden NFL 23' },
    { id: '2', title: 'FIFA 23' },
    { id: '8', title: 'Battlefield 2042' },
  ],
  activeIncidentIds: ['inc-fifa23-matchmaking'],
};

let toolIds = 0;
const callTool = (name: string, input: Record<string, unknown> = {}): ModelTurn => ({
  content: [{ type: 'tool_use', id: `toolu_${(toolIds += 1)}`, name, input }],
  stopReason: 'tool_use',
});
const say = (text: string): ModelTurn => ({ content: [{ type: 'text', text }], stopReason: 'end_turn' });

/** Plays back model turns in order and records every request body. */
const scripted = (...turns: (ModelTurn | Error)[]) => {
  const bodies: TurnBody[] = [];
  const transport: Transport = async (body) => {
    bodies.push(structuredClone(body));
    const next = turns.shift();
    if (!next) throw new Error('Unexpected model call');
    if (next instanceof Error) throw next;
    return next;
  };
  return { transport, bodies };
};

const request = (input: AgentInput, history: string[] = []): AgentRequest => ({
  conversationId: 'c',
  input,
  context,
  history,
  diagnostics: [],
});

const collect = async (engine: ReturnType<typeof createLiveEngine>, req: AgentRequest): Promise<AgentEvent[]> => {
  const events: AgentEvent[] = [];
  for await (const event of engine.run(req, new AbortController().signal)) events.push(event);
  return events;
};

const toolResults = (body: TurnBody | undefined): Extract<WireBlock, { type: 'tool_result' }>[] =>
  body?.messages.at(-1)?.content.flatMap((block) => (block.type === 'tool_result' ? [block] : [])) ?? [];

const cards = (events: AgentEvent[]) => events.flatMap((event) => (event.type === 'card' ? [event.card] : []));
const messages = (events: AgentEvent[]) => events.flatMap((event) => (event.type === 'message' ? [event] : []));

describe('live engine', () => {
  it('runs tools in the browser, shows the restore preview, and changes nothing until confirm', async () => {
    const { transport, bodies } = scripted(
      callTool('list_purchases', { game_id: '1' }),
      callTool('propose_restore', { purchase_id: 'pur-1001' }),
      say('Found it [purchase:pur-1001]. It qualifies for an instant restore [policy:instant-restore] [article:999].'),
    );
    const engine = createLiveEngine({ transport, fallback: demoEngine });
    const events = await collect(engine, request({ kind: 'text', text: 'My Madden Points never showed up' }));

    const listed = JSON.parse(toolResults(bodies[1])[0]?.content ?? '{}');
    expect(listed.purchases[0]).toMatchObject({ purchase_id: 'pur-1001', restore_decision: 'eligible' });
    expect(cards(events)).toEqual([expect.objectContaining({ type: 'action_preview', confirmLabel: 'Restore now' })]);
    const [reply] = messages(events);
    expect(reply?.text).toBe('Found it. It qualifies for an instant restore.');
    expect(reply?.level).toBe('L2');
    expect(reply?.citations?.map((citation) => citation.kind)).toEqual(['purchase', 'policy']);
    expect(getDemoState().grants).toEqual([]);
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('lets the rules engine refuse a restore the model asks for', async () => {
    const { transport, bodies } = scripted(
      callTool('propose_restore', { purchase_id: 'pur-1002' }),
      say('This one needs an advisor.'),
    );
    const events = await collect(
      createLiveEngine({ transport, fallback: demoEngine }),
      request({ kind: 'text', text: 'My Battlefield bundle never arrived' }),
    );
    expect(cards(events)).toEqual([]);
    expect(JSON.parse(toolResults(bodies[1])[0]?.content ?? '{}')).toMatchObject({
      proposed: false,
      decision: 'review',
    });
  });

  it('attaches verified order evidence when the model drafts a case', async () => {
    const { transport } = scripted(
      callTool('draft_case', { title: 'Missing bundle', summary: 'Never delivered.', purchase_id: 'pur-1002' }),
      say('I drafted a case for you to review.'),
    );
    const events = await collect(
      createLiveEngine({ transport, fallback: demoEngine }),
      request({ kind: 'text', text: 'My Battlefield bundle never arrived' }, ['My Battlefield bundle never arrived']),
    );
    const draft = cards(events).find((card) => card.type === 'case_draft');
    expect(draft?.type === 'case_draft' && draft.draft.evidence).toEqual(
      expect.arrayContaining([expect.stringContaining('Order EA-'), 'Delivered at purchase: no']),
    );
  });

  it('hands high-risk recovery to a person with no identity checks shown', async () => {
    const { transport } = scripted(callTool('start_account_recovery'), say('An advisor has everything.'));
    const text = 'I think someone hacked my account and changed my email';
    const events = await collect(
      createLiveEngine({ transport, fallback: demoEngine }),
      request({ kind: 'text', text }, [text]),
    );
    expect(events.some((event) => event.type === 'handoff')).toBe(true);
    expect(cards(events).some((card) => card.type === 'identity_check')).toBe(false);
    expect(messages(events).at(-1)?.level).toBe('L3');
  });

  it('sends safety triggers to a person without calling the model', async () => {
    const { transport, bodies } = scripted();
    const events = await collect(
      createLiveEngine({ transport, fallback: demoEngine }),
      request({ kind: 'text', text: 'I want to talk to a real person' }),
    );
    expect(bodies).toHaveLength(0);
    expect(events.some((event) => event.type === 'handoff')).toBe(true);
  });

  it('returns invalid tool input to the model as an error', async () => {
    const { transport, bodies } = scripted(callTool('list_purchases', { game_id: '42' }), say('Which game?'));
    await collect(createLiveEngine({ transport, fallback: demoEngine }), request({ kind: 'text', text: 'missing' }));
    expect(toolResults(bodies[1])[0]).toMatchObject({ is_error: true });
  });

  it('never runs a tool call cut off by max_tokens', async () => {
    const { transport } = scripted({
      content: [{ type: 'tool_use', id: 'toolu_cut', name: 'propose_restore', input: { purchase_id: 'pur-1001' } }],
      stopReason: 'max_tokens',
    });
    const events = await collect(
      createLiveEngine({ transport, fallback: demoEngine }),
      request({ kind: 'text', text: 'restore it' }),
    );
    expect(cards(events)).toEqual([]);
  });

  it('drops a refused turn so the next request starts clean', async () => {
    const { transport, bodies } = scripted(
      { content: [{ type: 'text', text: 'partial' }], stopReason: 'refusal' },
      say('Sure.'),
    );
    const engine = createLiveEngine({ transport, fallback: demoEngine });
    const refused = await collect(engine, request({ kind: 'text', text: 'first' }));
    expect(messages(refused)[0]?.text).toMatch(/Talk to a person/);
    await collect(engine, request({ kind: 'text', text: 'second' }));
    expect(bodies[1]?.messages.map((message) => message.role)).toEqual(['user']);
  });

  it('tells the model what happened in cards it did not run', async () => {
    const { transport, bodies } = scripted(say('Glad it worked.'));
    const engine = createLiveEngine({ transport, fallback: demoEngine });
    await collect(
      engine,
      request({
        kind: 'diagnostic_result',
        result: {
          treeId: 'bf2042-ps5-crash',
          treeTitle: 'Battlefield 2042 crashing on PS5',
          outcome: 'resolved',
          answers: [],
          log: [{ stepId: 'update', title: 'Install the latest update', outcome: 'done' }],
        },
      }),
    );
    await collect(engine, request({ kind: 'text', text: 'thanks' }));
    const note = bodies[0]?.messages[0]?.content[0];
    expect(note?.type === 'text' && note.text).toMatch(/^\[App event\] Guided troubleshooting finished/);
  });

  it('sends an attached screenshot before the text', async () => {
    const { transport, bodies } = scripted(say('That error is a connection timeout.'));
    await collect(
      createLiveEngine({ transport, fallback: demoEngine }),
      request({
        kind: 'text',
        text: 'What is this?',
        image: { name: 'err.jpg', mediaType: 'image/jpeg', data: 'AAAA' },
      }),
    );
    expect(bodies[0]?.messages[0]?.content.map((block) => block.type)).toEqual(['image', 'text']);
  });

  it('reports whether a failure happened before or after something was shown', async () => {
    const before = scripted(new LiveUnavailableError('rate_limited'));
    await expect(
      collect(
        createLiveEngine({ transport: before.transport, fallback: demoEngine }),
        request({ kind: 'text', text: 'hi' }),
      ),
    ).rejects.toMatchObject({ partial: false });

    const after = scripted(callTool('search_help_articles', { query: 'refund' }), new LiveUnavailableError('upstream'));
    await expect(
      collect(
        createLiveEngine({ transport: after.transport, fallback: demoEngine }),
        request({ kind: 'text', text: 'refund?' }),
      ),
    ).rejects.toMatchObject({ partial: true });
  });
});
