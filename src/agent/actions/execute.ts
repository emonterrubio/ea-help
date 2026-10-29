import {
  entitlementStatusFor,
  findPurchase,
  grantEntitlement,
  refreshEntitlements,
  resetCloudSave,
  undoGrant,
} from '@/services/ea-api/api';
import { demoPlayer } from '@/services/ea-api/fixtures';
import { findReceipt, markReceiptUndone, recordReceipt } from '@/services/ea-api/receipts';
import { findRecoverySession, resetCredentials, verifiedFactorsFor } from '@/services/ea-api/security';
import { getDemoState, type DemoState } from '@/services/ea-api/store';
import { evaluateRestoreEligibility } from '../policy/eligibility';
import { evaluateFixEligibility } from '../policy/fixes';
import { assessRecoveryRisk } from '../policy/risk';
import type { ActionCheck, ActionOutcome, ProposedAction } from './types';

const formatUsd = (amount: number): string => `$${amount.toFixed(2)}`;

/** Re-runs the rules engine for a proposed action against the current account state. */
export const checkAction = (action: ProposedAction, state: DemoState, now: Date): ActionCheck => {
  switch (action.kind) {
    case 'restore_entitlement': {
      const purchase = findPurchase(action.purchaseId);
      if (!purchase) return { allowed: false, reasons: ['That purchase is not on your account.'] };
      const decision = evaluateRestoreEligibility({
        purchase,
        entitlementGranted: entitlementStatusFor(purchase, state.grants) === 'granted',
        grants: state.grants,
        now,
      });
      if (decision.outcome === 'eligible') return { allowed: true };
      return { allowed: false, reasons: decision.outcome === 'review' ? decision.reasons : [decision.reason] };
    }
    case 'refresh_entitlements':
    case 'reset_cloud_save': {
      const decision = evaluateFixEligibility({
        kind: action.kind,
        gameId: action.gameId,
        ownedGameIds: demoPlayer.ownedGameIds,
        receipts: state.receipts,
        now,
      });
      return decision.outcome === 'allowed' ? { allowed: true } : { allowed: false, reasons: decision.reasons };
    }
    case 'reset_credentials': {
      const session = findRecoverySession(action.sessionId);
      if (!session) return { allowed: false, reasons: ['That sign-in attempt could not be found.'] };
      const risk = assessRecoveryRisk({
        newDevice: session.newDevice,
        regionChanged: session.regionChanged,
        recentEmailChange: session.recentEmailChange,
        verifiedFactors: verifiedFactorsFor(session.id, state).length,
      });
      return risk.level === 'low' ? { allowed: true } : { allowed: false, reasons: risk.reasons };
    }
  }
};

const restore = async (purchaseId: string, now: Date) => {
  const grant = await grantEntitlement(purchaseId, now);
  const purchase = findPurchase(purchaseId);
  return recordReceipt(
    {
      referenceId: grant.referenceId,
      kind: 'restore_entitlement',
      subject: purchaseId,
      title: `Restored ${grant.itemName}`,
      appliedAt: grant.grantedAt,
      undoable: true,
    },
    {
      gameId: purchase?.gameId ?? null,
      summary: `${grant.itemName} was paid for but never reached your account. The Help Agent verified the purchase and restored it after you confirmed.`,
      details: purchase
        ? [
            `Order ${purchase.orderNumber}, ${formatUsd(purchase.amountUsd)} on ${purchase.platform}`,
            'Delivered at purchase: no',
            'Instant restore policy: eligible (under the value limit, recent, not refunded)',
          ]
        : [],
      outcome: 'Restored to your account.',
    },
    now,
  );
};

/**
 * Applies a confirmed action. The rules engine runs again here, so an ineligible or
 * high-risk action is rejected even if something calls this directly.
 */
export const executeAction = async (action: ProposedAction, now = new Date()): Promise<ActionOutcome> => {
  const check = checkAction(action, getDemoState(), now);
  if (!check.allowed) return { status: 'rejected', reasons: check.reasons };

  switch (action.kind) {
    case 'restore_entitlement':
      return { status: 'applied', receipt: await restore(action.purchaseId, now) };
    case 'refresh_entitlements':
      return { status: 'applied', receipt: await refreshEntitlements(action.gameId, now) };
    case 'reset_cloud_save':
      return { status: 'applied', receipt: await resetCloudSave(action.gameId, now) };
    case 'reset_credentials':
      return { status: 'applied', receipt: await resetCredentials(action.sessionId, now) };
  }
};

/** Reverses an undoable change and records the undo on its receipt and case. */
export const undoAction = async (referenceId: string, now = new Date()): Promise<boolean> => {
  const receipt = findReceipt(referenceId);
  if (!receipt?.undoable || receipt.undoneAt) return false;
  if (receipt.kind === 'restore_entitlement') await undoGrant(referenceId, now);
  markReceiptUndone(referenceId, now);
  return true;
};
