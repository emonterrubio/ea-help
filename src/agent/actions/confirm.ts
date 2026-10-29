import { findPurchase, getPlayerProfile } from '@/services/ea-api/api';
import { listRecentSignIns } from '@/services/ea-api/security';
import type { ActionReceipt } from '@/services/ea-api/types';
import { draftReviewCase } from '../casework';
import { answerFor } from '../knowledge/search';
import { nextEventId, pause, statusEvent } from '../pacing';
import { policyCitation } from '../policy/policies';
import type { AgentContext, AgentEvent, AgentRequest, Citation } from '../protocol';
import { executeAction } from './execute';
import type { ProposedAction } from './types';

const PROGRESS: Record<ProposedAction['kind'], string> = {
  restore_entitlement: 'Re-checking eligibility, then restoring your item…',
  refresh_entitlements: 'Refreshing your licenses…',
  reset_cloud_save: 'Resetting the cloud settings cache…',
  reset_credentials: 'Re-checking risk signals, then resetting your password…',
};

const receiptCard = (receipt: ActionReceipt): AgentEvent => ({
  type: 'card',
  id: nextEventId(),
  level: 'L2',
  card: {
    type: 'receipt',
    referenceId: receipt.referenceId,
    title: receipt.title,
    appliedAt: receipt.appliedAt,
    undoable: receipt.undoable,
    caseId: receipt.caseId,
  },
});

const purchaseCitation = (purchaseId: string): Citation[] => {
  const purchase = findPurchase(purchaseId);
  return purchase ? [{ kind: 'purchase', purchaseId, label: `Order ${purchase.orderNumber}` }] : [];
};

/** After a password reset: review sign-ins and show what is done and what is left. */
async function* securityChecklist(context: AgentContext, signal: AbortSignal) {
  yield statusEvent('Reviewing your recent sign-ins…');
  await pause(signal);
  const [player, signIns] = await Promise.all([getPlayerProfile(), listRecentSignIns()]);
  const recognized = signIns.filter((signIn) => signIn.recognized).length;
  yield {
    type: 'card',
    id: nextEventId(),
    level: 'L2',
    card: {
      type: 'security_checklist',
      items: [
        { label: `Password reset link sent to ${player.maskedEmail}`, done: true },
        { label: 'Signed out of every other device', done: true },
        {
          label: `Reviewed ${signIns.length} recent sign-ins: ${recognized === signIns.length ? 'all from your devices' : `${signIns.length - recognized} not recognized`}`,
          done: recognized === signIns.length,
        },
        { label: 'Turn on login verification (2FA)', done: false },
      ],
    },
  } satisfies AgentEvent;
  const article = answerFor('turn on login verification', { gameTitles: [] })?.article;
  yield {
    type: 'message',
    id: nextEventId(),
    level: 'L0',
    text: `One thing left for you: turn on login verification, so any new device needs a code before it can sign in as ${context.playerName.split(' ')[0] ?? 'you'}.`,
    citations: article ? [{ kind: 'article', articleId: article.id, title: article.title }] : undefined,
  } satisfies AgentEvent;
}

const appliedMessage = (action: ProposedAction, receipt: ActionReceipt): AgentEvent => {
  switch (action.kind) {
    case 'restore_entitlement':
      return {
        type: 'message',
        id: nextEventId(),
        level: 'L2',
        text: `Done. ${receipt.title.replace(/^Restored /, '')} is back on your account. If the game is open, restart it to see it. Your receipt is below and in My Cases, where you can undo it.`,
        citations: purchaseCitation(action.purchaseId),
      };
    case 'reset_credentials':
      return {
        type: 'message',
        id: nextEventId(),
        level: 'L2',
        text: "Done. Check your email for the reset link, then sign in with your new password. I've signed out every other device, so anyone else who had access is out.",
        citations: [policyCitation('account-recovery')],
      };
    case 'refresh_entitlements':
    case 'reset_cloud_save':
      return {
        type: 'message',
        id: nextEventId(),
        level: 'L2',
        text: `Done. ${receipt.title}. Start the game again and let me know if that sorted it.`,
      };
  }
};

/**
 * Runs an action the player confirmed. This executes in the browser, never from the
 * model, and `executeAction` re-checks the rules engine before anything changes.
 */
export async function* runConfirmedAction(request: AgentRequest, signal: AbortSignal): AsyncGenerator<AgentEvent> {
  if (request.input.kind !== 'confirm_action') return;
  const { action } = request.input;
  yield statusEvent(PROGRESS[action.kind]);
  await pause(signal);
  const outcome = await executeAction(action);

  if (outcome.status === 'rejected') {
    yield {
      type: 'message',
      id: nextEventId(),
      level: 'L3',
      text: `I checked again before changing anything, and this now needs a person: ${outcome.reasons.join(' ')} Nothing on your account was changed. I drafted a case so an advisor can pick it up.`,
    } satisfies AgentEvent;
    yield {
      type: 'card',
      id: nextEventId(),
      level: 'L3',
      card: {
        type: 'case_draft',
        draftId: nextEventId(),
        draft: draftReviewCase({
          title: 'Change needs advisor review',
          finding:
            'The Help Agent proposed a change, but the rules engine blocked it when re-checked. No changes were applied.',
          gameId: null,
          evidence: outcome.reasons.map((reason) => `Blocked: ${reason}`),
          history: request.history,
          context: request.context,
        }),
      },
    } satisfies AgentEvent;
    yield { type: 'done' };
    return;
  }

  yield appliedMessage(action, outcome.receipt);
  yield receiptCard(outcome.receipt);
  if (action.kind === 'reset_credentials') yield* securityChecklist(request.context, signal);
  yield { type: 'done' };
}
