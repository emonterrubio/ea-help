import type { Incident, PlayerProfile, Purchase, RecoverySession, SignInRecord } from './types';

const HOUR_MS = 60 * 60 * 1000;
/**
 * Purchase and sign-in times are relative to page load, so the demo's eligibility
 * windows (e.g. 30 days for an instant restore) hold whenever the prototype is viewed.
 */
const hoursAgo = (hours: number): string => new Date(Date.now() - hours * HOUR_MS).toISOString();

/** The signed-in demo player. Game ids refer to `src/data/games.ts`. */
export const demoPlayer: PlayerProfile = {
  id: 'player-tomcook',
  displayName: 'Tom Cook',
  maskedEmail: 't•••@example.com',
  avatarUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  platform: 'PS5',
  region: 'US',
  language: 'en-US',
  // Madden NFL 23, FIFA 23, Battlefield 2042, Apex Legends, Star Wars: Squadrons
  ownedGameIds: ['1', '2', '8', '9', '10'],
};

export const demoPurchases: Purchase[] = [
  {
    id: 'pur-1001',
    gameId: '1',
    itemName: 'Madden NFL 23 Ultimate Team: 2,800 Madden Points',
    sku: 'M23-MUT-2800',
    amountUsd: 19.99,
    purchasedAt: hoursAgo(40),
    platform: 'PS5',
    orderNumber: 'EA-8F3K-2210',
    refundStatus: 'none',
    fulfilledAtPurchase: false,
  },
  {
    id: 'pur-1002',
    gameId: '8',
    itemName: 'Battlefield 2042 Year 2 Ultimate Pass Bundle',
    sku: 'BF2042-Y2-ULT',
    amountUsd: 99.99,
    purchasedAt: hoursAgo(4 * 24 + 10),
    platform: 'PS5',
    orderNumber: 'EA-2Q9D-7731',
    refundStatus: 'none',
    fulfilledAtPurchase: false,
  },
  {
    id: 'pur-1003',
    gameId: '2',
    itemName: 'FIFA 23 Ultimate Team: 1,050 FIFA Points',
    sku: 'F23-FUT-1050',
    amountUsd: 9.99,
    purchasedAt: hoursAgo(16 * 24),
    platform: 'PS5',
    orderNumber: 'EA-5T1M-0912',
    refundStatus: 'none',
    fulfilledAtPurchase: true,
  },
  {
    id: 'pur-1004',
    gameId: '9',
    itemName: 'Apex Legends: 1,000 Apex Coins',
    sku: 'APEX-1000',
    amountUsd: 9.99,
    purchasedAt: hoursAgo(28 * 24),
    platform: 'PS5',
    orderNumber: 'EA-7R4C-5530',
    refundStatus: 'refunded',
    fulfilledAtPurchase: false,
  },
];

export const demoIncidents: Incident[] = [
  {
    id: 'inc-fifa23-matchmaking',
    gameId: '2',
    title: 'FIFA 23 Ultimate Team matchmaking delays',
    summary: 'Some players see long queues or "Unable to connect" in Division Rivals and Squad Battles.',
    platforms: ['PS5', 'PS4', 'Xbox Series X|S', 'Xbox One', 'PC'],
    status: 'identified',
    startedAt: '2026-10-28T14:10:00Z',
    eta: 'Fix expected within 2 hours',
  },
];

/** Recent sign-ins on the demo account (reviewed during account recovery). */
export const demoSignIns: SignInRecord[] = [
  { id: 'signin-1', device: 'PS5', location: 'Austin, US', at: hoursAgo(2), recognized: true },
  { id: 'signin-2', device: 'EA app on Windows', location: 'Austin, US', at: hoursAgo(26), recognized: true },
  { id: 'signin-3', device: 'EA app on iPhone', location: 'Austin, US', at: hoursAgo(74), recognized: true },
];

/** Sign-in attempts the agent can be asked to recover. */
export const demoRecoverySessions: RecoverySession[] = [
  {
    id: 'recovery-usual-device',
    device: 'PS5',
    location: 'Austin, US',
    attemptedAt: hoursAgo(0.1),
    newDevice: false,
    regionChanged: false,
    recentEmailChange: false,
  },
  {
    id: 'recovery-new-device',
    device: 'Windows PC (Chrome)',
    location: 'São Paulo, BR',
    attemptedAt: hoursAgo(0.1),
    newDevice: true,
    regionChanged: true,
    recentEmailChange: true,
  },
];
