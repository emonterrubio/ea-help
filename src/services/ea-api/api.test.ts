import {
  entitlementStatusFor,
  findPurchase,
  getEntitlementStatus,
  grantEntitlement,
  listIncidents,
  listPurchases,
  setIncidentFollowed,
  undoGrant,
} from './api';
import { DEMO_STATE_STORAGE_KEY, getDemoState, resetDemoState } from './store';

describe('mock EA Help APIs', () => {
  it('filters purchases by game', async () => {
    expect((await listPurchases('1')).map((p) => p.id)).toEqual(['pur-1001']);
  });

  it('grants a missing entitlement, records a receipt, and persists it', async () => {
    expect(await getEntitlementStatus('pur-1001')).toBe('missing');
    const grant = await grantEntitlement('pur-1001', new Date('2026-10-28T12:00:00Z'));
    expect(grant.referenceId).toMatch(/^EAR-/);
    expect(await getEntitlementStatus('pur-1001')).toBe('granted');
    expect(window.localStorage.getItem(DEMO_STATE_STORAGE_KEY)).toContain(grant.referenceId);
  });

  it('refuses to grant twice and supports undo', async () => {
    const grant = await grantEntitlement('pur-1001');
    await expect(grantEntitlement('pur-1001')).rejects.toThrow(/already granted/);
    await undoGrant(grant.referenceId);
    expect(await getEntitlementStatus('pur-1001')).toBe('missing');
  });

  it('treats items delivered at purchase as granted', () => {
    const purchase = findPurchase('pur-1003');
    expect(purchase && entitlementStatusFor(purchase, [])).toBe('granted');
  });

  it("lists active incidents for the player's games and tracks follows", async () => {
    const incidents = await listIncidents();
    expect(incidents.map((incident) => incident.id)).toEqual(['inc-fifa23-matchmaking']);
    expect(await listIncidents(['8'])).toEqual([]);

    await setIncidentFollowed('inc-fifa23-matchmaking', true);
    expect(getDemoState().followedIncidentIds).toEqual(['inc-fifa23-matchmaking']);
    await setIncidentFollowed('inc-fifa23-matchmaking', false);
    expect(getDemoState().followedIncidentIds).toEqual([]);
  });

  it('resets every change', async () => {
    await grantEntitlement('pur-1001');
    resetDemoState();
    expect(getDemoState().grants).toEqual([]);
    expect(window.localStorage.getItem(DEMO_STATE_STORAGE_KEY)).toBeNull();
  });
});
