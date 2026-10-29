import type { ActionReceipt } from '@/services/ea-api/types';

/**
 * A change the agent proposes (L2). The model only ever produces one of these; the
 * browser runs it after the player taps confirm, and the rules engine checks it again.
 */
export type ProposedAction =
  | { kind: 'restore_entitlement'; purchaseId: string }
  | { kind: 'refresh_entitlements'; gameId: string }
  | { kind: 'reset_cloud_save'; gameId: string }
  | { kind: 'reset_credentials'; sessionId: string };

export type ActionCheck = { allowed: true } | { allowed: false; reasons: string[] };

export type ActionOutcome = { status: 'applied'; receipt: ActionReceipt } | { status: 'rejected'; reasons: string[] };
