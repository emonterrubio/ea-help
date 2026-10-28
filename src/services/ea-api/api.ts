import games from '@/data/games';
import type { Game } from '@/types/domain';
import { demoIncidents, demoPlayer, demoPurchases } from './fixtures';
import { simulateLatency } from './latency';
import { getDemoState, updateDemoState } from './store';
import type { EntitlementStatus, Grant, Incident, PlayerProfile, Purchase } from './types';

/*
 * Mock EA Help APIs. Every function only ever touches the signed-in demo player's
 * own data (least privilege). They are async to mirror real network calls.
 */

export const getPlayerProfile = async (): Promise<PlayerProfile> => {
  await simulateLatency();
  return demoPlayer;
};

export const listOwnedGames = async (): Promise<Game[]> => {
  await simulateLatency();
  return games.filter((game) => demoPlayer.ownedGameIds.includes(game.id));
};

export const listPurchases = async (gameId?: string): Promise<Purchase[]> => {
  await simulateLatency();
  return gameId ? demoPurchases.filter((purchase) => purchase.gameId === gameId) : demoPurchases;
};

export const findPurchase = (purchaseId: string): Purchase | undefined =>
  demoPurchases.find((purchase) => purchase.id === purchaseId);

/** The active (not undone) grant for a purchase, if one exists. */
export const activeGrantFor = (purchaseId: string, grants: readonly Grant[]): Grant | undefined =>
  grants.find((grant) => grant.purchaseId === purchaseId && !grant.undoneAt);

export const entitlementStatusFor = (purchase: Purchase, grants: readonly Grant[]): EntitlementStatus =>
  purchase.fulfilledAtPurchase || activeGrantFor(purchase.id, grants) ? 'granted' : 'missing';

export const getEntitlementStatus = async (purchaseId: string): Promise<EntitlementStatus> => {
  await simulateLatency();
  const purchase = findPurchase(purchaseId);
  if (!purchase) throw new Error(`Unknown purchase ${purchaseId}`);
  return entitlementStatusFor(purchase, getDemoState().grants);
};

const createReferenceId = (now: Date): string =>
  `EAR-${now.getTime().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0')}`;

/**
 * Grants a missing entitlement and records a receipt. Callers must run the
 * eligibility rules first (the agent's `executeAction` does).
 */
export const grantEntitlement = async (purchaseId: string, now = new Date()): Promise<Grant> => {
  await simulateLatency();
  const purchase = findPurchase(purchaseId);
  if (!purchase) throw new Error(`Unknown purchase ${purchaseId}`);
  if (entitlementStatusFor(purchase, getDemoState().grants) === 'granted') {
    throw new Error(`Purchase ${purchaseId} is already granted`);
  }
  const grant: Grant = {
    referenceId: createReferenceId(now),
    purchaseId,
    itemName: purchase.itemName,
    grantedAt: now.toISOString(),
  };
  updateDemoState((state) => ({ ...state, grants: [...state.grants, grant] }));
  return grant;
};

/** Undo path for an automated grant (reversibility guardrail). */
export const undoGrant = async (referenceId: string, now = new Date()): Promise<void> => {
  await simulateLatency();
  updateDemoState((state) => ({
    ...state,
    grants: state.grants.map((grant) =>
      grant.referenceId === referenceId && !grant.undoneAt ? { ...grant, undoneAt: now.toISOString() } : grant,
    ),
  }));
};

/** Active incidents affecting any of the given games (defaults to the player's games). */
export const listIncidents = async (gameIds: readonly string[] = demoPlayer.ownedGameIds): Promise<Incident[]> => {
  await simulateLatency();
  return demoIncidents.filter((incident) => incident.status !== 'resolved' && gameIds.includes(incident.gameId));
};

export const setIncidentFollowed = async (incidentId: string, followed: boolean): Promise<void> => {
  await simulateLatency();
  updateDemoState((state) => {
    const others = state.followedIncidentIds.filter((id) => id !== incidentId);
    return { ...state, followedIncidentIds: followed ? [...others, incidentId] : others };
  });
};
