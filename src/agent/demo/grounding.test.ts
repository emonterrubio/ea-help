import articles from '@/data/articles';
import { demoIncidents } from '@/services/ea-api/fixtures';
import type { AgentEvent, AgentRequest } from '../protocol';
import { demoEngine } from './demoEngine';
import { SCENARIOS } from './scenarios';

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

const run = async (input: AgentRequest['input']): Promise<AgentEvent[]> => {
  const events: AgentEvent[] = [];
  for await (const event of demoEngine.run(
    { conversationId: 'c', input, context, history: [], diagnostics: [] },
    new AbortController().signal,
  )) {
    events.push(event);
  }
  return events;
};

const citationsOf = (events: AgentEvent[]) =>
  events.flatMap((event) => (event.type === 'message' ? (event.citations ?? []) : []));

const FREE_TEXT = [
  'How do I request a refund?',
  'how do I update my password',
  'I want to report a player for harassment in chat',
  'Is there a server outage?',
  'purple elephants',
];

describe('grounding', () => {
  it('cites only real articles and incidents across every scenario and free-text query', async () => {
    const runs = await Promise.all([
      ...SCENARIOS.map((scenario) => run({ kind: 'scenario', scenarioId: scenario.id })),
      ...FREE_TEXT.map((text) => run({ kind: 'text', text })),
    ]);
    const citations = runs.flatMap(citationsOf);
    expect(citations.length).toBeGreaterThan(0);
    for (const citation of citations) {
      if (citation.kind === 'article') {
        expect(articles.find((article) => article.id === citation.articleId)?.title).toBe(citation.title);
      }
      if (citation.kind === 'incident') {
        expect(demoIncidents.some((incident) => incident.id === citation.incidentId)).toBe(true);
      }
    }
  });
});

describe('demo engine, Phase 1 flows', () => {
  it('answers the quick-answer scenario from the login verification article (L0)', async () => {
    const events = await run({ kind: 'scenario', scenarioId: 'quick-answer' });
    const message = events.find((event) => event.type === 'message');
    expect(message?.type === 'message' && message.level).toBe('L0');
    expect(message?.type === 'message' && message.citations?.[0]).toMatchObject({
      kind: 'article',
      title: 'How to turn on EA Login Verification',
    });
  });

  it('reports the known issue with status, ETA and an incident card', async () => {
    const events = await run({ kind: 'scenario', scenarioId: 'known-issue' });
    const message = events.find((event) => event.type === 'message');
    expect(message?.type === 'message' && message.text).toMatch(/known issue.*Fix expected within 2 hours/);
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'card', card: { type: 'incident', incidentId: 'inc-fifa23-matchmaking' } }),
    );
  });

  it('declines to guess when no approved answer exists', async () => {
    const events = await run({ kind: 'text', text: 'purple elephants' });
    const message = events.find((event) => event.type === 'message');
    expect(message?.type === 'message' && message.text).toMatch(/won't guess/);
    expect(message?.type === 'message' && message.citations).toBeUndefined();
  });
});
