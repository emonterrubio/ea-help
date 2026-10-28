import type { AgentEvent, AgentRequest } from '../protocol';
import { demoEngine } from './demoEngine';

const context = {
  playerName: 'Tom Cook',
  platform: 'PS5',
  region: 'US',
  ownedGames: [{ id: '1', title: 'Madden NFL 23' }],
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
    });
    expect(events.map((event) => event.type)).toEqual(['status', 'message', 'done']);
    const message = events[1];
    expect(message?.type === 'message' && message.level).toBe('L1');
  });

  it('hands off with a summary of what the player said', async () => {
    const events = await collect({
      conversationId: 'c',
      input: { kind: 'talk_to_person' },
      context,
      history: ['My pack never arrived'],
    });
    const handoff = events.find((event) => event.type === 'handoff');
    expect(handoff?.type === 'handoff' && handoff.summary).toContain('My pack never arrived');
    expect(handoff?.type === 'handoff' && handoff.summary).toContain('PS5');
  });

  it('stops when aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const events = demoEngine.run(
      { conversationId: 'c', input: { kind: 'scenario', scenarioId: 'quick-answer' }, context, history: [] },
      controller.signal,
    );
    const iterator = events[Symbol.asyncIterator]();
    await iterator.next(); // first status is yielded before the pause
    await expect(iterator.next()).rejects.toBeDefined();
  });
});
