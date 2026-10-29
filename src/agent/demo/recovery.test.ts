import { executeAction } from '../actions/execute';
import { DEMO_EMAIL_CODE, DEMO_RECOVERY_SESSIONS, verifyIdentityFactor } from '@/services/ea-api/security';
import { getDemoState } from '@/services/ea-api/store';
import { runConfirmedAction } from '../actions/confirm';
import type { AgentCard, AgentEvent, AgentRequest } from '../protocol';
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

const request = (input: AgentRequest['input'], history: string[] = []): AgentRequest => ({
  conversationId: 'c',
  input,
  context,
  history,
  diagnostics: [],
});

const collect = async (events: AsyncIterable<AgentEvent>): Promise<AgentEvent[]> => {
  const collected: AgentEvent[] = [];
  for await (const event of events) collected.push(event);
  return collected;
};

const run = (input: AgentRequest['input'], history?: string[]) =>
  collect(demoEngine.run(request(input, history), new AbortController().signal));

const cardsOf = (events: AgentEvent[]): AgentCard[] =>
  events.flatMap((event) => (event.type === 'card' ? [event.card] : []));

describe('Instant Content Recovery', () => {
  it('previews an eligible restore with purchase and policy citations (L2)', async () => {
    const events = await run({ kind: 'scenario', scenarioId: 'content-recovery' });
    const message = events.find((event) => event.type === 'message');
    expect(message).toMatchObject({ level: 'L2' });
    expect(message?.type === 'message' && message.citations?.map((citation) => citation.kind)).toEqual([
      'purchase',
      'policy',
    ]);
    expect(cardsOf(events)[0]).toMatchObject({
      type: 'action_preview',
      action: { kind: 'restore_entitlement', purchaseId: 'pur-1001' },
      confirmLabel: 'Restore now',
    });
    // Previewing changes nothing.
    expect(getDemoState().grants).toEqual([]);
  });

  it('offers a license refresh once the item is already on the account', async () => {
    await executeAction({ kind: 'restore_entitlement', purchaseId: 'pur-1001' });
    const events = await run({ kind: 'scenario', scenarioId: 'content-recovery' });
    expect(cardsOf(events)[0]).toMatchObject({
      type: 'action_preview',
      action: { kind: 'refresh_entitlements', gameId: '1' },
    });
  });

  it('drafts a case with the order evidence when the purchase needs review (L3)', async () => {
    const events = await run({ kind: 'scenario', scenarioId: 'content-review' }, [
      'My Battlefield 2042 Year 2 Ultimate Pass bundle never arrived',
    ]);
    const message = events.find((event) => event.type === 'message');
    expect(message).toMatchObject({ level: 'L3' });
    expect(message?.type === 'message' && message.text).not.toMatch(/send (us )?a screenshot/i);
    const draft = cardsOf(events).find((card) => card.type === 'case_draft');
    expect(draft?.type === 'case_draft' && draft.draft.evidence.join(' ')).toMatch(
      /Order EA-2Q9D-7731.*\$99\.99.*Review reason: Purchases over \$50/,
    );
    expect(getDemoState().grants).toEqual([]);
  });

  it('turns a confirmed restore into a receipt, and a blocked one into a case', async () => {
    const confirm = (purchaseId: string) =>
      collect(
        runConfirmedAction(
          request({ kind: 'confirm_action', action: { kind: 'restore_entitlement', purchaseId } }),
          new AbortController().signal,
        ),
      );
    const applied = await confirm('pur-1001');
    expect(cardsOf(applied)[0]).toMatchObject({ type: 'receipt', undoable: true });
    const blocked = await confirm('pur-1002');
    expect(blocked.find((event) => event.type === 'message')).toMatchObject({ level: 'L3' });
    expect(cardsOf(blocked)[0]?.type).toBe('case_draft');
  });
});

describe('Secure Account Recovery', () => {
  it('asks for identity checks on a low-risk sign-in', async () => {
    const events = await run({ kind: 'scenario', scenarioId: 'account-recovery' });
    expect(cardsOf(events)).toEqual([{ type: 'identity_check', sessionId: DEMO_RECOVERY_SESSIONS.usualDevice }]);
  });

  it('proposes a reset only after the checks pass', async () => {
    const sessionId = DEMO_RECOVERY_SESSIONS.usualDevice;
    await verifyIdentityFactor(sessionId, 'email_code', DEMO_EMAIL_CODE);
    await verifyIdentityFactor(sessionId, 'purchase_history', 'pur-1001');
    const events = await run({ kind: 'identity_verified', sessionId });
    expect(cardsOf(events)[0]).toMatchObject({
      type: 'action_preview',
      action: { kind: 'reset_credentials', sessionId },
    });
  });

  it('hands off when the checks did not actually pass', async () => {
    const events = await run({ kind: 'identity_verified', sessionId: DEMO_RECOVERY_SESSIONS.usualDevice });
    expect(events.some((event) => event.type === 'handoff')).toBe(true);
    expect(cardsOf(events)).toEqual([]);
  });

  it('routes a high-risk session straight to a person with zero changes (L3)', async () => {
    const events = await run({ kind: 'scenario', scenarioId: 'account-recovery-risky' }, [
      'I think someone hacked my account and changed my email',
    ]);
    expect(events.find((event) => event.type === 'message')).toMatchObject({ level: 'L3' });
    expect(cardsOf(events)).toEqual([]);
    const created = getDemoState().createdCases[0];
    expect(created?.timeline[0]?.details).toContain('Account changes applied by the Help Agent: none');
    expect(getDemoState().receipts).toEqual([]);
  });

  it('shows a security checklist after a confirmed reset', async () => {
    const sessionId = DEMO_RECOVERY_SESSIONS.usualDevice;
    await verifyIdentityFactor(sessionId, 'email_code', DEMO_EMAIL_CODE);
    await verifyIdentityFactor(sessionId, 'purchase_history', 'pur-1001');
    const events = await collect(
      runConfirmedAction(
        request({ kind: 'confirm_action', action: { kind: 'reset_credentials', sessionId } }),
        new AbortController().signal,
      ),
    );
    const checklist = cardsOf(events).find((card) => card.type === 'security_checklist');
    expect(checklist?.type === 'security_checklist' && checklist.items.map((item) => item.done)).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });
});
