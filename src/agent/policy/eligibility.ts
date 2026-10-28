import type { Grant, Purchase } from '@/services/ea-api/types';

/** Policy limits for automated content recovery. Decided by rules, never by the model. */
export interface RestorePolicy {
  /** Grants above this value always go to human review (PRD open question: L2 → L3 threshold). */
  maxAutoGrantUsd: number;
  /** Maximum automated grants per player per day. */
  maxGrantsPerDay: number;
  /** Purchases older than this go to review. */
  maxPurchaseAgeDays: number;
}

export const DEFAULT_RESTORE_POLICY: RestorePolicy = {
  maxAutoGrantUsd: 50,
  maxGrantsPerDay: 3,
  maxPurchaseAgeDays: 30,
};

export type RestoreDecision =
  /** Agent may show a restore preview; the grant runs after the player confirms (L2). */
  | { outcome: 'eligible' }
  /** Nothing to restore: the item is already on the account. */
  | { outcome: 'not_needed'; reason: string }
  /** A person must review; the agent drafts a case with the evidence (L3). */
  | { outcome: 'review'; reasons: string[] };

export interface RestoreRequest {
  purchase: Purchase;
  entitlementGranted: boolean;
  /** All grants recorded for this player (used for the daily cap). */
  grants: readonly Grant[];
  now: Date;
  policy?: RestorePolicy;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const grantsInLastDay = (grants: readonly Grant[], now: Date): number =>
  grants.filter((grant) => !grant.undoneAt && now.getTime() - Date.parse(grant.grantedAt) < DAY_MS).length;

/** Deterministic eligibility check for restoring a missing purchase. */
export const evaluateRestoreEligibility = ({
  purchase,
  entitlementGranted,
  grants,
  now,
  policy = DEFAULT_RESTORE_POLICY,
}: RestoreRequest): RestoreDecision => {
  if (entitlementGranted) {
    return { outcome: 'not_needed', reason: 'The item is already on your account.' };
  }

  const reasons: string[] = [];
  if (purchase.refundStatus === 'refunded') reasons.push('This purchase was refunded.');
  if (purchase.refundStatus === 'chargeback') reasons.push('This purchase has an open chargeback.');
  if (purchase.amountUsd > policy.maxAutoGrantUsd) {
    reasons.push(`Purchases over $${policy.maxAutoGrantUsd} are reviewed by an advisor.`);
  }
  const ageDays = (now.getTime() - Date.parse(purchase.purchasedAt)) / DAY_MS;
  if (ageDays > policy.maxPurchaseAgeDays) {
    reasons.push(`Purchases older than ${policy.maxPurchaseAgeDays} days are reviewed by an advisor.`);
  }
  if (grantsInLastDay(grants, now) >= policy.maxGrantsPerDay) {
    reasons.push('The daily limit for automatic restores has been reached.');
  }

  return reasons.length > 0 ? { outcome: 'review', reasons } : { outcome: 'eligible' };
};
