import { demoPurchases } from '@/services/ea-api/fixtures';
import type { Grant, Purchase } from '@/services/ea-api/types';
import { DEFAULT_RESTORE_POLICY, evaluateRestoreEligibility } from './eligibility';

// Fixture purchase times are relative to load, so the policy is checked against now.
const NOW = new Date();
const purchase = (id: string): Purchase => {
  const found = demoPurchases.find((item) => item.id === id);
  if (!found) throw new Error(`fixture ${id} missing`);
  return found;
};
const grant = (hoursAgo: number, undone = false): Grant => ({
  referenceId: `ref-${hoursAgo}`,
  purchaseId: 'other',
  itemName: 'Other',
  grantedAt: new Date(NOW.getTime() - hoursAgo * 3_600_000).toISOString(),
  ...(undone ? { undoneAt: NOW.toISOString() } : {}),
});

describe('evaluateRestoreEligibility', () => {
  it('allows a recent, low-value, undelivered purchase (L2 with confirm)', () => {
    expect(
      evaluateRestoreEligibility({ purchase: purchase('pur-1001'), entitlementGranted: false, grants: [], now: NOW }),
    ).toEqual({ outcome: 'eligible' });
  });

  it('reports nothing to restore when the item is already granted', () => {
    expect(
      evaluateRestoreEligibility({ purchase: purchase('pur-1003'), entitlementGranted: true, grants: [], now: NOW })
        .outcome,
    ).toBe('not_needed');
  });

  it('sends purchases over the value threshold to review', () => {
    const decision = evaluateRestoreEligibility({
      purchase: purchase('pur-1002'),
      entitlementGranted: false,
      grants: [],
      now: NOW,
    });
    expect(decision).toEqual({ outcome: 'review', reasons: ['Purchases over $50 are reviewed by an advisor.'] });
  });

  it('sends refunded purchases to review', () => {
    const decision = evaluateRestoreEligibility({
      purchase: purchase('pur-1004'),
      entitlementGranted: false,
      grants: [],
      now: NOW,
    });
    expect(decision.outcome).toBe('review');
  });

  it('sends chargebacks and old purchases to review', () => {
    const old = { ...purchase('pur-1001'), refundStatus: 'chargeback' as const, purchasedAt: '2026-08-01T00:00:00Z' };
    const decision = evaluateRestoreEligibility({ purchase: old, entitlementGranted: false, grants: [], now: NOW });
    expect(decision.outcome === 'review' && decision.reasons).toHaveLength(2);
  });

  it('enforces the daily grant cap, ignoring undone and older grants', () => {
    const atCap = Array.from({ length: DEFAULT_RESTORE_POLICY.maxGrantsPerDay }, (_, i) => grant(i + 1));
    expect(
      evaluateRestoreEligibility({ purchase: purchase('pur-1001'), entitlementGranted: false, grants: atCap, now: NOW })
        .outcome,
    ).toBe('review');

    const notCounted = [grant(1, true), grant(30), grant(2)];
    expect(
      evaluateRestoreEligibility({
        purchase: purchase('pur-1001'),
        entitlementGranted: false,
        grants: notCounted,
        now: NOW,
      }).outcome,
    ).toBe('eligible');
  });
});
