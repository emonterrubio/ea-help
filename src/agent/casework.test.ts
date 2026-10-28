import { advisorGreeting, describeSteps, detectSentiment, draftCase } from './casework';
import type { DiagnosticResult } from './diagnostics/types';

const context = {
  playerName: 'Tom Cook',
  platform: 'PS5',
  region: 'US',
  ownedGames: [{ id: '8', title: 'Battlefield 2042' }],
  activeIncidentIds: [],
};

const result: DiagnosticResult = {
  treeId: 'bf2042-ps5-crash',
  treeTitle: 'Battlefield 2042 crashing on PS5',
  answers: [{ question: 'When does the crash happen?', answer: 'During multiplayer matches' }],
  log: [
    { stepId: 'update', title: 'Install the latest update', outcome: 'failed' },
    { stepId: 'network', title: 'Check your connection', outcome: 'skipped' },
  ],
  outcome: 'unresolved',
};

describe('detectSentiment', () => {
  it.each([
    ['My game crashes', 'calm'],
    ["This is the third time I've asked", 'frustrated'],
    ['I feel unsafe, someone keeps harassing me', 'distressed'],
  ] as const)('%s → %s', (text, sentiment) => {
    expect(detectSentiment([text])).toBe(sentiment);
  });
});

describe('draftCase', () => {
  it('carries the issue, evidence and every step tried', () => {
    const draft = draftCase(['Battlefield 2042 keeps crashing on my PS5'], [result], context);
    expect(draft.title).toBe('Battlefield 2042 crashing on PS5');
    expect(draft.gameId).toBe('8');
    expect(draft.evidence).toEqual(
      expect.arrayContaining([
        'Platform: PS5 (US)',
        'Game: Battlefield 2042',
        'When does the crash happen? During multiplayer matches',
      ]),
    );
    expect(draft.stepsTried).toEqual(["Install the latest update: didn't work", 'Check your connection: skipped']);
    expect(draft.summary).toContain('Tried 2 guided troubleshooting steps on PS5');
  });

  it('works with no diagnostics', () => {
    const draft = draftCase([], [], context);
    expect(draft.stepsTried).toEqual([]);
    expect(draft.summary).toContain('No troubleshooting completed yet.');
  });
});

describe('advisorGreeting', () => {
  it('greets by first name and references what was tried', () => {
    const draft = draftCase(['crash'], [result], context);
    expect(advisorGreeting(draft, context)).toBe(
      "Hi Tom, I'm Jordan. I've read your case and the 2 steps you already tried on your PS5, so we'll pick up from there.",
    );
  });

  it('describes steps with player-friendly outcomes', () => {
    expect(describeSteps([result])[0]).toBe("Install the latest update: didn't work");
  });
});
