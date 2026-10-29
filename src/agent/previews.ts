import type { Purchase } from '@/services/ea-api/types';
import { nextEventId } from './pacing';
import type { AgentCard } from './protocol';

/*
 * Action previews (L2) shared by both engines. The engine only builds the card;
 * nothing changes until the player taps confirm and `executeAction` re-checks policy.
 */

export const formatUsd = (amount: number): string => `$${amount.toFixed(2)}`;

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const restorePreview = (purchase: Purchase, gameTitle: string): AgentCard => ({
  type: 'action_preview',
  actionId: nextEventId(),
  action: { kind: 'restore_entitlement', purchaseId: purchase.id },
  title: `Restore ${purchase.itemName}`,
  details: [
    { label: 'Game', value: gameTitle },
    { label: 'Order', value: purchase.orderNumber },
    { label: 'Purchased', value: formatDate(purchase.purchasedAt) },
    { label: 'Paid', value: formatUsd(purchase.amountUsd) },
    { label: 'Platform', value: purchase.platform },
  ],
  changes: [
    `Add ${purchase.itemName} to your EA account`,
    `Sync it to your ${purchase.platform} the next time ${gameTitle} starts`,
    'Record a receipt in My Cases, where you can undo it',
  ],
  confirmLabel: 'Restore now',
});

export const licenseRefreshPreview = (gameId: string, gameTitle: string, platform: string): AgentCard => ({
  type: 'action_preview',
  actionId: nextEventId(),
  action: { kind: 'refresh_entitlements', gameId },
  title: `Refresh your ${gameTitle} licenses`,
  details: [
    { label: 'Game', value: gameTitle },
    { label: 'Platform', value: platform },
  ],
  changes: [`Re-sync your ${gameTitle} licenses with your ${platform}`, 'Nothing is removed or charged'],
  confirmLabel: 'Refresh licenses',
});
