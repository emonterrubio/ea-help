import { getEntitlementStatus } from '@/services/ea-api/api';
import { DEMO_EMAIL_CODE, DEMO_RECOVERY_SESSIONS, verifyIdentityFactor } from '@/services/ea-api/security';
import { getDemoState } from '@/services/ea-api/store';
import { executeAction, undoAction } from './execute';

const passIdentityChecks = async (sessionId: string) => {
  await verifyIdentityFactor(sessionId, 'email_code', DEMO_EMAIL_CODE);
  await verifyIdentityFactor(sessionId, 'purchase_history', 'pur-1001');
};

describe('executeAction (L2, re-checked by the rules engine)', () => {
  it('restores an eligible purchase with a receipt and a My Cases entry', async () => {
    const outcome = await executeAction({ kind: 'restore_entitlement', purchaseId: 'pur-1001' });
    expect(outcome.status).toBe('applied');
    if (outcome.status !== 'applied') return;
    expect(outcome.receipt).toMatchObject({ kind: 'restore_entitlement', undoable: true });
    expect(outcome.receipt.referenceId).toMatch(/^EAR-/);
    expect(await getEntitlementStatus('pur-1001')).toBe('granted');
    expect(getDemoState().createdCases[0]?.receiptReferenceId).toBe(outcome.receipt.referenceId);
  });

  it('rejects ineligible restores even when called directly, and changes nothing', async () => {
    const overLimit = await executeAction({ kind: 'restore_entitlement', purchaseId: 'pur-1002' });
    const refunded = await executeAction({ kind: 'restore_entitlement', purchaseId: 'pur-1004' });
    const unknown = await executeAction({ kind: 'restore_entitlement', purchaseId: 'pur-9999' });
    expect([overLimit.status, refunded.status, unknown.status]).toEqual(['rejected', 'rejected', 'rejected']);
    expect(getDemoState().grants).toEqual([]);
    expect(getDemoState().receipts).toEqual([]);
  });

  it('will not restore the same purchase twice', async () => {
    await executeAction({ kind: 'restore_entitlement', purchaseId: 'pur-1001' });
    const again = await executeAction({ kind: 'restore_entitlement', purchaseId: 'pur-1001' });
    expect(again).toEqual({ status: 'rejected', reasons: ['The item is already on your account.'] });
  });

  it('undoes a restore and records it on the receipt and its case', async () => {
    const outcome = await executeAction({ kind: 'restore_entitlement', purchaseId: 'pur-1001' });
    if (outcome.status !== 'applied') throw new Error('expected a restore');
    expect(await undoAction(outcome.receipt.referenceId)).toBe(true);
    expect(await getEntitlementStatus('pur-1001')).toBe('missing');
    expect(getDemoState().receipts[0]?.undoneAt).toBeDefined();
    expect(getDemoState().createdCases[0]?.plainStatus.now).toMatch(/^Undone/);
    expect(await undoAction(outcome.receipt.referenceId)).toBe(false);
  });

  it('caps one-click fixes and refuses games the player does not own', async () => {
    expect((await executeAction({ kind: 'reset_cloud_save', gameId: '8' })).status).toBe('applied');
    expect((await executeAction({ kind: 'reset_cloud_save', gameId: '8' })).status).toBe('rejected');
    expect((await executeAction({ kind: 'refresh_entitlements', gameId: '3' })).status).toBe('rejected');
  });

  it('never resets credentials on a high-risk session, even after identity checks', async () => {
    await passIdentityChecks(DEMO_RECOVERY_SESSIONS.newDevice);
    const outcome = await executeAction({ kind: 'reset_credentials', sessionId: DEMO_RECOVERY_SESSIONS.newDevice });
    expect(outcome.status).toBe('rejected');
    expect(outcome.status === 'rejected' && outcome.reasons).toContain('Sign-in attempt from a new region');
    expect(getDemoState().receipts).toEqual([]);
  });

  it('needs two identity checks before a low-risk reset, and they are single-use', async () => {
    const sessionId = DEMO_RECOVERY_SESSIONS.usualDevice;
    expect((await executeAction({ kind: 'reset_credentials', sessionId })).status).toBe('rejected');
    await passIdentityChecks(sessionId);
    const outcome = await executeAction({ kind: 'reset_credentials', sessionId });
    expect(outcome.status === 'applied' && outcome.receipt.undoable).toBe(false);
    expect((await executeAction({ kind: 'reset_credentials', sessionId })).status).toBe('rejected');
  });
});
