import { getDemoState } from '@/services/ea-api/store';
import type { DiagnosticResult } from '../diagnostics/types';
import type { AgentEvent, AgentRequest } from '../protocol';
import { demoEngine } from './demoEngine';

const context = {
  playerName: 'Tom Cook',
  platform: 'PS5',
  region: 'US',
  ownedGames: [{ id: '8', title: 'Battlefield 2042' }],
  activeIncidentIds: [],
};

const failedRun: DiagnosticResult = {
  treeId: 'bf2042-ps5-crash',
  treeTitle: 'Battlefield 2042 crashing on PS5',
  answers: [{ question: 'When does the crash happen?', answer: 'During multiplayer matches' }],
  log: [
    { stepId: 'update', title: 'Install the latest update', outcome: 'failed' },
    { stepId: 'network', title: 'Check your connection', outcome: 'failed' },
  ],
  outcome: 'unresolved',
};

const run = async (input: AgentRequest['input'], extra: Partial<AgentRequest> = {}) => {
  const events: AgentEvent[] = [];
  const request: AgentRequest = {
    conversationId: 'c',
    input,
    context,
    history: ['Battlefield 2042 keeps crashing on my PS5'],
    diagnostics: [],
    ...extra,
  };
  for await (const event of demoEngine.run(request, new AbortController().signal)) events.push(event);
  return events;
};

describe('Phase 2 flows', () => {
  it('drafts a case with the full diagnostic log when nothing works (L3)', async () => {
    const events = await run({ kind: 'diagnostic_result', result: failedRun });
    const card = events.find((event) => event.type === 'card');
    expect(card).toMatchObject({ level: 'L3', card: { type: 'case_draft' } });
    expect(card?.type === 'card' && card.card.type === 'case_draft' && card.card.draft.stepsTried).toEqual([
      "Install the latest update: didn't work",
      "Check your connection: didn't work",
    ]);
    expect(getDemoState().createdCases).toHaveLength(0);
  });

  it('celebrates a fix without creating a case', async () => {
    const events = await run({
      kind: 'diagnostic_result',
      result: {
        ...failedRun,
        outcome: 'resolved',
        log: [{ stepId: 'update', title: 'Install the latest update', outcome: 'done' }],
      },
    });
    expect(events.find((event) => event.type === 'message')).toMatchObject({ level: 'L1' });
    expect(events.some((event) => event.type === 'card' || event.type === 'handoff')).toBe(false);
  });

  it('creates the case and hands off when the player sends the draft', async () => {
    const drafted = await run({ kind: 'diagnostic_result', result: failedRun });
    const card = drafted.find((event) => event.type === 'card');
    if (card?.type !== 'card' || card.card.type !== 'case_draft') throw new Error('expected a draft');
    const events = await run({ kind: 'submit_case', draft: card.card.draft });
    const handoff = events.find((event) => event.type === 'handoff');
    const [created] = getDemoState().createdCases;
    expect(handoff?.type === 'handoff' && handoff.caseId).toBe(created?.id);
    expect(created?.timeline.flatMap((entry) => entry.details ?? [])).toContain("Check your connection: didn't work");
  });

  describe('every escalation carries the diagnostic log', () => {
    it('via "Talk to a person"', async () => {
      await run({ kind: 'talk_to_person' }, { diagnostics: [failedRun] });
      const [created] = getDemoState().createdCases;
      expect(created?.timeline.flatMap((entry) => entry.details ?? [])).toContain(
        "Install the latest update: didn't work",
      );
    });

    it('via a safety or sentiment trigger, immediately', async () => {
      const events = await run(
        { kind: 'text', text: 'This is the third time. I want to talk to a real person.' },
        { diagnostics: [failedRun] },
      );
      expect(events[0]).toMatchObject({ type: 'message', level: 'L3' });
      expect(events.some((event) => event.type === 'status' && event.text === 'Understanding your request…')).toBe(
        false,
      );
      const [created] = getDemoState().createdCases;
      expect(created?.timeline.flatMap((entry) => entry.details ?? [])).toContain("Check your connection: didn't work");
    });
  });
});
