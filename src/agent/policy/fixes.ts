import type { ActionReceipt } from '@/services/ea-api/types';

/** One-click fixes the agent can offer inside guided diagnostics (L2). */
export type FixKind = 'refresh_entitlements' | 'reset_cloud_save';

/** How often each fix may run per game per day. */
export const FIX_DAILY_LIMITS: Record<FixKind, number> = {
  refresh_entitlements: 3,
  // Resetting cached settings is disruptive; once a day is enough to rule it in or out.
  reset_cloud_save: 1,
};

export type FixDecision = { outcome: 'allowed' } | { outcome: 'denied'; reasons: string[] };

export interface FixRequest {
  kind: FixKind;
  gameId: string;
  ownedGameIds: readonly string[];
  receipts: readonly ActionReceipt[];
  now: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deterministic check for a one-click fix. Decided by rules, never by the model. */
export const evaluateFixEligibility = ({ kind, gameId, ownedGameIds, receipts, now }: FixRequest): FixDecision => {
  const reasons: string[] = [];
  if (!ownedGameIds.includes(gameId)) reasons.push('This game is not on your account.');
  const runsToday = receipts.filter(
    (receipt) =>
      receipt.kind === kind && receipt.subject === gameId && now.getTime() - Date.parse(receipt.appliedAt) < DAY_MS,
  ).length;
  if (runsToday >= FIX_DAILY_LIMITS[kind]) reasons.push('This fix has already run today for this game.');
  return reasons.length > 0 ? { outcome: 'denied', reasons } : { outcome: 'allowed' };
};
