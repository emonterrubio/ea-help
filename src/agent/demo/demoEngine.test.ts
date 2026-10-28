import type { AgentEvent, AgentRequest } from '../protocol';
import { demoEngine } from './demoEngine';

const context = {
  playerName: 'Tom Cook',
  platform: 'PS5',
  region: 'US',
  ownedGames: [
    { id: '1', title: 'Madden NFL 23' },
    { id: '8', title: 'Battlefield 2042' },
  ],
  activeIncidentIds: [],
};

const collect = async (request: AgentRequest): Promise<AgentEvent[]> => {
  const events: AgentEvent[] = [];
  for await (const event of demoEngine.run(request, new AbortController().signal)) events.push(event);
  return events;
};

describe('demoEngine', () => {
  it('narrates, answers and finishes for a routed text request', async () => {
    const events = await collect({
      conversationId: 'c',
      input: { kind: 'text', text: 'Battlefield 2042 keeps crashing on my PS5' },
      context,
      history: [],
      diagnostics: [],
    });
    expect(events.map((event) => event.type)).toEqual(['status', 'status', 'message', 'card', 'done']);
    expect(events[2]).toMatchObject({ type: 'message', level: 'L1' });
    expect(events[3]).toMatchObject({
      type: 'card',
      level: 'L1',
      card: { type: 'diagnostic', treeId: 'bf2042-ps5-crash' },
    });
  });

  it('hands off with a summary of what the player said', async () => {
    const events = await collect({
      conversationId: 'c',
      input: { kind: 'talk_to_person' },
      context,
      history: ['My pack never arrived'],
      diagnostics: [],
    });
    const handoff = events.find((event) => event.type === 'handoff');
    expect(handoff?.type === 'handoff' && handoff.summary).toContain('My pack never arrived');
    expect(handoff?.type === 'handoff' && handoff.caseNumber).toMatch(/^\d{10}$/);
    expect(handoff?.type === 'handoff' && handoff.greeting).toMatch(/^Hi Tom, I'm Jordan/);
  });

  it('stops when aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const events = demoEngine.run(
      {
        conversationId: 'c',
        input: { kind: 'scenario', scenarioId: 'quick-answer' },
        context,
        history: [],
        diagnostics: [],
      },
      controller.signal,
    );
    const iterator = events[Symbol.asyncIterator]();
    await iterator.next(); // first status is yielded before the pause
    await expect(iterator.next()).rejects.toBeDefined();
  });
});
