/** Shapes returned by the mock EA Help APIs (the same APIs v1 exposes). */

export type Platform = 'PS5' | 'PS4' | 'Xbox Series X|S' | 'Xbox One' | 'PC' | 'Switch' | 'Mobile';

export interface PlayerProfile {
  id: string;
  displayName: string;
  /** Masked for display, e.g. `t•••@example.com`. */
  maskedEmail: string;
  avatarUrl: string;
  platform: Platform;
  region: string;
  language: string;
  ownedGameIds: string[];
}

export type RefundStatus = 'none' | 'refunded' | 'chargeback';

export interface Purchase {
  id: string;
  gameId: string;
  itemName: string;
  sku: string;
  amountUsd: number;
  /** ISO 8601 timestamp. */
  purchasedAt: string;
  platform: Platform;
  orderNumber: string;
  refundStatus: RefundStatus;
  /** Whether the platform's entitlement service delivered the item at purchase time. */
  fulfilledAtPurchase: boolean;
}

export type EntitlementStatus = 'granted' | 'missing';

/** Record of an automated grant (shown as a receipt in My Cases). */
export interface Grant {
  referenceId: string;
  purchaseId: string;
  itemName: string;
  grantedAt: string;
  /** Set when the player undid the grant. */
  undoneAt?: string;
}

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface Incident {
  id: string;
  gameId: string;
  title: string;
  summary: string;
  platforms: Platform[];
  status: IncidentStatus;
  startedAt: string;
  /** Human-readable ETA, e.g. "Fix expected within 2 hours". */
  eta: string;
}
