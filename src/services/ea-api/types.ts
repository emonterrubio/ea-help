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

/** Where a case interaction happened; all channels share one timeline (Living Cases). */
export type TimelineChannel = 'web' | 'ai' | 'chat' | 'email' | 'system' | 'receipt';

export interface TimelineEntry {
  id: string;
  channel: TimelineChannel;
  author: string;
  /** Display timestamp. */
  at: string;
  title: string;
  body?: string;
  details?: string[];
}

/** Plain-language case status: what's happening now, what happens next, and when. */
export interface PlainStatus {
  now: string;
  next: string;
  eta: string;
}

export type Sentiment = 'calm' | 'frustrated' | 'distressed';

/** What the agent drafted and the player reviewed before sending. */
export interface CaseDraftInput {
  title: string;
  summary: string;
  gameId: string | null;
  evidence: string[];
  stepsTried: string[];
  sentiment: Sentiment;
  transcript: string[];
  advisorName: string;
}

/** Account changes the agent may apply, always after a player tap (L2). */
export type ActionKind = 'restore_entitlement' | 'refresh_entitlements' | 'reset_cloud_save' | 'reset_credentials';

/** Every L2 change leaves a receipt with a reference ID (and undo where it can be reversed). */
export interface ActionReceipt {
  referenceId: string;
  kind: ActionKind;
  /** What the change applied to: a purchase, game or recovery session id. */
  subject: string;
  title: string;
  /** ISO 8601 timestamp. */
  appliedAt: string;
  undoable: boolean;
  undoneAt?: string;
  /** The My Cases entry that records this change, if one was created. */
  caseId?: string;
}

/** Identity checks the player can pass during account recovery. */
export type IdentityFactor = 'email_code' | 'purchase_history';

/** A sign-in attempt being recovered, with the signals that cap the agent's autonomy. */
export interface RecoverySession {
  id: string;
  device: string;
  location: string;
  /** ISO 8601 timestamp. */
  attemptedAt: string;
  newDevice: boolean;
  regionChanged: boolean;
  /** Account email changed within the last 14 days. */
  recentEmailChange: boolean;
}

export interface SignInRecord {
  id: string;
  device: string;
  location: string;
  /** ISO 8601 timestamp. */
  at: string;
  recognized: boolean;
}
