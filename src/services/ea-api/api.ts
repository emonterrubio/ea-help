import games from '@/data/games';
import type { Game } from '@/types/domain';
import { demoIncidents, demoPlayer, demoPurchases } from './fixtures';
import { simulateLatency } from './latency';
import { createReferenceId, recordReceipt } from './receipts';
import { getDemoState, updateDemoState } from './store';
import type {
  ActionReceipt,
  EntitlementStatus,
  Grant,
  Incident,
  IncidentStatus,
  PlayerProfile,
  Purchase,
} from './types';

/*
 * Mock EA Help APIs. Every function only ever touches the signed-in demo player's
 * own data (least privilege). They are async to mirror real network calls.
 */

export const getPlayerProfile = async (): Promise<PlayerProfile> => {
  await simulateLatency();
  return demoPlayer;
};

/** Titles of the player's games, for filtering answers (synchronous, used while typing). */
export const ownedGameTitles = (): string[] =>
  games.filter((game) => demoPlayer.ownedGameIds.includes(game.id)).map((game) => game.title);

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

/** Grants recorded for the player (feeds the daily restore cap). */
export const listGrants = async (): Promise<Grant[]> => {
  await simulateLatency();
  return getDemoState().grants;
};

const gameTitle = (gameId: string): string => games.find((game) => game.id === gameId)?.title ?? 'game';

/** One-click fix: re-syncs the player's licenses for a game. Callers run the fix policy first. */
export const refreshEntitlements = async (gameId: string, now = new Date()): Promise<ActionReceipt> => {
  await simulateLatency();
  return recordReceipt({
    referenceId: createReferenceId(now),
    kind: 'refresh_entitlements',
    subject: gameId,
    title: `Refreshed your ${gameTitle(gameId)} licenses`,
    appliedAt: now.toISOString(),
    undoable: false,
  });
};

/** One-click fix: clears a game's cached cloud settings (progress and unlocks are kept). */
export const resetCloudSave = async (gameId: string, now = new Date()): Promise<ActionReceipt> => {
  await simulateLatency();
  return recordReceipt({
    referenceId: createReferenceId(now),
    kind: 'reset_cloud_save',
    subject: gameId,
    title: `Reset the ${gameTitle(gameId)} cloud settings cache`,
    appliedAt: now.toISOString(),
    undoable: false,
  });
};

/** Incident fixtures with live status changes applied. */
export const incidentsWithStatus = (overrides: Readonly<Record<string, IncidentStatus>>): Incident[] =>
  demoIncidents.map((incident) => ({ ...incident, status: overrides[incident.id] ?? incident.status }));

/** Unresolved incidents affecting any of the given games. Synchronous selector for rendering. */
export const selectActiveIncidents = (
  overrides: Readonly<Record<string, IncidentStatus>>,
  gameIds: readonly string[] = demoPlayer.ownedGameIds,
): Incident[] =>
  incidentsWithStatus(overrides).filter(
    (incident) => incident.status !== 'resolved' && gameIds.includes(incident.gameId),
  );

/** Active incidents affecting any of the given games (defaults to the player's games). */
export const listIncidents = async (gameIds: readonly string[] = demoPlayer.ownedGameIds): Promise<Incident[]> => {
  await simulateLatency();
  return selectActiveIncidents(getDemoState().incidentStatus, gameIds);
};

export const findIncident = (incidentId: string, overrides: Readonly<Record<string, IncidentStatus>>) =>
  incidentsWithStatus(overrides).find((incident) => incident.id === incidentId);

const NEXT_STATUS: Record<IncidentStatus, IncidentStatus> = {
  investigating: 'identified',
  identified: 'monitoring',
  monitoring: 'resolved',
  resolved: 'resolved',
};

/** Moves every unresolved incident one step toward resolved (prototype "simulate update"). */
export const advanceIncidents = (): void => {
  updateDemoState((state) => ({
    ...state,
    incidentStatus: Object.fromEntries(
      incidentsWithStatus(state.incidentStatus).map((incident) => [incident.id, NEXT_STATUS[incident.status]]),
    ),
  }));
};

/** Optimistic: the follow state changes immediately, then the (simulated) request completes. */
export const setIncidentFollowed = async (incidentId: string, followed: boolean): Promise<void> => {
  updateDemoState((state) => {
    const others = state.followedIncidentIds.filter((id) => id !== incidentId);
    return { ...state, followedIncidentIds: followed ? [...others, incidentId] : others };
  });
  await simulateLatency();
};
