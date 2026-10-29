import type { ActionReceipt } from '@/services/ea-api/types';
import { evaluateFixEligibility, FIX_DAILY_LIMITS } from './fixes';

const NOW = new Date('2026-10-28T12:00:00Z');
const receipt = (kind: ActionReceipt['kind'], gameId: string, hoursAgo: number): ActionReceipt => ({
  referenceId: `ref-${kind}-${hoursAgo}`,
  kind,
  subject: gameId,
  title: 'Fix',
  appliedAt: new Date(NOW.getTime() - hoursAgo * 3_600_000).toISOString(),
  undoable: false,
});
const base = { gameId: '8', ownedGameIds: ['1', '8'], receipts: [], now: NOW };

describe('evaluateFixEligibility', () => {
  it('allows a fix for an owned game', () => {
    expect(evaluateFixEligibility({ ...base, kind: 'refresh_entitlements' })).toEqual({ outcome: 'allowed' });
  });

  it('denies games the player does not own', () => {
    expect(evaluateFixEligibility({ ...base, kind: 'refresh_entitlements', gameId: '3' }).outcome).toBe('denied');
  });

  it.each(Object.entries(FIX_DAILY_LIMITS))('caps %s at %i per game per day', (kind, limit) => {
    const fixKind = kind as keyof typeof FIX_DAILY_LIMITS;
    const today = Array.from({ length: limit }, (_, i) => receipt(fixKind, '8', i + 1));
    expect(evaluateFixEligibility({ ...base, kind: fixKind, receipts: today }).outcome).toBe('denied');
    // Older runs, other games and other fixes don't count.
    const notCounted = [receipt(fixKind, '8', 30), receipt(fixKind, '1', 1), receipt('restore_entitlement', '8', 1)];
    expect(evaluateFixEligibility({ ...base, kind: fixKind, receipts: notCounted }).outcome).toBe('allowed');
  });
});
