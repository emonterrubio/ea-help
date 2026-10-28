import cases from '@/data/cases';
import { createAgentCase, findAnyCase, plainStatusFor, timelineForCase } from './cases';
import { getDemoState } from './store';

const fixture = (id: string) => {
  const found = cases.find((item) => item.id === id);
  if (!found) throw new Error(`missing case ${id}`);
  return found;
};

const draft = {
  title: 'Battlefield 2042 crashing on PS5',
  summary: 'Tom Cook reported a crash.',
  gameId: '8',
  evidence: ['Platform: PS5 (US)'],
  stepsTried: ["Install the latest update: didn't work"],
  sentiment: 'calm' as const,
  transcript: ['crash'],
  advisorName: 'Jordan',
};

describe('cases API', () => {
  it('builds a unified timeline for an open v1 case from its chat history', () => {
    const timeline = timelineForCase(fixture('1'));
    expect(timeline[0]).toMatchObject({ channel: 'web', title: 'Case opened on EA Help' });
    expect(timeline.filter((entry) => entry.channel === 'chat').length).toBeGreaterThan(0);
  });

  it('adds the advisor email and closure for closed cases', () => {
    expect(timelineForCase(fixture('3')).map((entry) => entry.channel)).toEqual(['web', 'email', 'system']);
  });

  it('explains status in plain language', () => {
    expect(plainStatusFor(fixture('1')).eta).toBe('Next reply within 2 business days');
    expect(plainStatusFor(fixture('2')).now).toMatch(/waiting to hear from you|wait to hear from you/);
    expect(plainStatusFor(fixture('3')).now).toBe('Resolved.');
  });

  it('creates and finds agent cases with the game logo and an open status', async () => {
    const created = await createAgentCase(draft, new Date('2026-10-28T12:00:00Z'));
    expect(created).toMatchObject({ status: 'open', type: 'active', game: 'Battlefield 2042', platform: 'PS5' });
    expect(getDemoState().createdCases[0]?.id).toBe(created.id);
    expect(findAnyCase(created.id)).toEqual(created);
    expect(plainStatusFor(created).now).toContain('Jordan');
  });
});
