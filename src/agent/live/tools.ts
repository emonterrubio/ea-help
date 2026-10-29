import {
  entitlementStatusFor,
  findPurchase,
  getEntitlementStatus,
  listGrants,
  listIncidents,
  listPurchases,
} from '@/services/ea-api/api';
import { INCIDENT_STATUS_LABELS, incidentExpectation } from '@/services/ea-api/incidentStatus';
import { getRecoverySession } from '@/services/ea-api/security';
import { getDemoState } from '@/services/ea-api/store';
import { draftCase, takeoverCaseDraft } from '../casework';
import { treeFor } from '../diagnostics/trees';
import { handOff } from '../handoff';
import { searchHelpArticles } from '../knowledge/search';
import { nextEventId, pause, statusEvent } from '../pacing';
import { evaluateRestoreEligibility } from '../policy/eligibility';
import { evaluateFixEligibility } from '../policy/fixes';
import type { ToolName } from '../policy/autonomy';
import { policyCitation } from '../policy/policies';
import { assessRecoveryRisk, MIN_VERIFIED_FACTORS } from '../policy/risk';
import { formatDate, formatUsd, licenseRefreshPreview, restorePreview } from '../previews';
import type { AgentEvent, AgentRequest } from '../protocol';
import type { CitationRegistry } from './citations';

/*
 * Browser-side handlers for the live agent's tools (schemas: api/agent.ts). They run
 * against the same mock EA APIs and rules engine as the demo. Read-only tools return data;
 * L2 tools return a preview card at most; L3 tools draft or hand off. None of them
 * changes the account: that only happens in `executeAction` after the player confirms.
 */

export interface ToolContext {
  request: AgentRequest;
  signal: AbortSignal;
  citations: CitationRegistry;
  /** The sign-in attempt being recovered (simulated: the demo has two fixtures). */
  signInAttempt: () => string;
  now: () => Date;
}

/** What goes back to the model as the tool result. */
export interface ToolOutcome {
  output: Record<string, unknown>;
  isError?: boolean;
}

type ToolHandler = (input: Record<string, unknown>, ctx: ToolContext) => AsyncGenerator<AgentEvent, ToolOutcome>;

const ARTICLE_TEXT_LIMIT = 500;

const invalid = (message: string): ToolOutcome => ({ output: { error: message }, isError: true });

const stringInput = (input: Record<string, unknown>, key: string, max = 200): string | null => {
  const value = input[key];
  return typeof value === 'string' && value.trim() && value.length <= max ? value.trim() : null;
};

/** A nullable string argument: `undefined` means the input was invalid. */
const nullableInput = (input: Record<string, unknown>, key: string): string | null | undefined => {
  const value = input[key];
  if (value === null) return null;
  return stringInput(input, key) ?? undefined;
};

const ownedGame = (ctx: ToolContext, gameId: string) =>
  ctx.request.context.ownedGames.find((game) => game.id === gameId);

const gameTitleFor = (ctx: ToolContext, gameId: string): string => ownedGame(ctx, gameId)?.title ?? 'your game';

const searchHelpArticlesTool: ToolHandler = async function* (input, ctx) {
  const query = stringInput(input, 'query');
  if (!query) return invalid('query must be a non-empty string');
  yield statusEvent('Searching EA Help articles…');
  await pause(ctx.signal);
  const matches = searchHelpArticles(query, {
    gameTitles: ctx.request.context.ownedGames.map((game) => game.title),
    limit: 3,
  });
  return {
    output: {
      articles: matches.map(({ article }) => ({
        marker: ctx.citations.add({ kind: 'article', articleId: article.id, title: article.title }),
        title: article.title,
        product: article.product,
        text: article.preview.slice(0, ARTICLE_TEXT_LIMIT),
      })),
      ...(matches.length === 0 ? { note: 'No approved article matched. Do not answer from memory.' } : {}),
    },
  };
};

const getKnownIssuesTool: ToolHandler = async function* (input, ctx) {
  const gameId = nullableInput(input, 'game_id');
  if (gameId === undefined || (gameId !== null && !ownedGame(ctx, gameId))) {
    return invalid("game_id must be one of the player's game ids, or null");
  }
  yield statusEvent('Checking live service status for your games…');
  await pause(ctx.signal);
  const ownedIds = ctx.request.context.ownedGames.map((game) => game.id);
  const incidents = await listIncidents(gameId ? [gameId] : ownedIds);
  for (const incident of incidents) {
    yield {
      type: 'card',
      id: nextEventId(),
      level: 'L0',
      card: { type: 'incident', incidentId: incident.id },
    } satisfies AgentEvent;
  }
  return {
    output: {
      incidents: incidents.map((incident) => ({
        marker: ctx.citations.add({ kind: 'incident', incidentId: incident.id, label: 'EA service status' }),
        game: gameTitleFor(ctx, incident.gameId),
        title: incident.title,
        summary: incident.summary,
        status: INCIDENT_STATUS_LABELS[incident.status],
        expectation: incidentExpectation(incident.status, incident.eta),
        shown_to_player: 'An incident card with a Follow button is already on screen.',
      })),
    },
  };
};

const listPurchasesTool: ToolHandler = async function* (input, ctx) {
  const gameId = nullableInput(input, 'game_id');
  if (gameId === undefined || (gameId !== null && !ownedGame(ctx, gameId))) {
    return invalid("game_id must be one of the player's game ids, or null");
  }
  yield statusEvent(
    gameId ? `Checking your ${gameTitleFor(ctx, gameId)} purchases…` : 'Checking your recent purchases…',
  );
  await pause(ctx.signal);
  const [purchases, grants] = await Promise.all([listPurchases(gameId ?? undefined), listGrants()]);
  const now = ctx.now();
  const newestFirst = [...purchases].sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  return {
    output: {
      purchases: newestFirst.map((purchase) => {
        const delivered = entitlementStatusFor(purchase, grants) === 'granted';
        const decision = evaluateRestoreEligibility({ purchase, entitlementGranted: delivered, grants, now });
        return {
          purchase_id: purchase.id,
          marker: ctx.citations.add({
            kind: 'purchase',
            purchaseId: purchase.id,
            label: `Order ${purchase.orderNumber}`,
          }),
          item: purchase.itemName,
          game: gameTitleFor(ctx, purchase.gameId),
          game_id: purchase.gameId,
          order_number: purchase.orderNumber,
          paid: formatUsd(purchase.amountUsd),
          purchased: formatDate(purchase.purchasedAt),
          platform: purchase.platform,
          delivered,
          refund_status: purchase.refundStatus,
          restore_decision: decision.outcome,
          ...(decision.outcome === 'review' ? { review_reasons: decision.reasons } : {}),
        };
      }),
      policy_marker: ctx.citations.add(policyCitation('instant-restore')),
    },
  };
};

const startGuidedDiagnosticsTool: ToolHandler = async function* (input, ctx) {
  const gameId = stringInput(input, 'game_id', 10);
  const game = gameId ? ownedGame(ctx, gameId) : undefined;
  if (!game) return invalid("game_id must be one of the player's game ids");
  const { platform } = ctx.request.context;
  const tree = treeFor(game.id, platform);
  if (!tree) {
    return { output: { available: false, reason: `No authored troubleshooting for ${game.title} on ${platform}.` } };
  }
  yield statusEvent(`Checking your ${game.title} setup on ${platform}…`);
  await pause(ctx.signal);
  yield {
    type: 'card',
    id: nextEventId(),
    level: 'L1',
    card: { type: 'diagnostic', treeId: tree.id },
  } satisfies AgentEvent;
  return {
    output: {
      available: true,
      guide: tree.title,
      shown_to_player:
        'A troubleshooting card with two questions and step-by-step fixes is on screen. The app reports the outcome later.',
    },
  };
};

const proposeRestoreTool: ToolHandler = async function* (input, ctx) {
  const purchaseId = stringInput(input, 'purchase_id', 40);
  const purchase = purchaseId ? findPurchase(purchaseId) : undefined;
  if (!purchase) return invalid('Unknown purchase_id. Call list_purchases first.');
  yield statusEvent('Checking whether it reached your account…');
  await pause(ctx.signal);
  const [entitlement, grants] = await Promise.all([getEntitlementStatus(purchase.id), listGrants()]);
  const decision = evaluateRestoreEligibility({
    purchase,
    entitlementGranted: entitlement === 'granted',
    grants,
    now: ctx.now(),
  });
  const policyMarker = ctx.citations.add(policyCitation('instant-restore'));
  switch (decision.outcome) {
    case 'eligible':
      yield {
        type: 'card',
        id: nextEventId(),
        level: 'L2',
        card: restorePreview(purchase, gameTitleFor(ctx, purchase.gameId)),
      } satisfies AgentEvent;
      return {
        output: {
          proposed: true,
          shown_to_player: 'A restore preview with a "Restore now" button. Nothing changes until the player taps it.',
          policy_marker: policyMarker,
        },
      };
    case 'not_needed':
      return {
        output: {
          proposed: false,
          decision: 'not_needed',
          reason: decision.reason,
          next: 'propose_license_refresh for this game',
        },
      };
    case 'review':
      return {
        output: {
          proposed: false,
          decision: 'review',
          reasons: decision.reasons,
          next: 'draft_case with this purchase_id',
          policy_marker: policyMarker,
        },
      };
  }
};

const proposeLicenseRefreshTool: ToolHandler = async function* (input, ctx) {
  const gameId = stringInput(input, 'game_id', 10);
  const game = gameId ? ownedGame(ctx, gameId) : undefined;
  if (!game) return invalid("game_id must be one of the player's game ids");
  const decision = evaluateFixEligibility({
    kind: 'refresh_entitlements',
    gameId: game.id,
    ownedGameIds: ctx.request.context.ownedGames.map((owned) => owned.id),
    receipts: getDemoState().receipts,
    now: ctx.now(),
  });
  if (decision.outcome === 'denied') return { output: { proposed: false, reasons: decision.reasons } };
  yield {
    type: 'card',
    id: nextEventId(),
    level: 'L2',
    card: licenseRefreshPreview(game.id, game.title, ctx.request.context.platform),
  } satisfies AgentEvent;
  return {
    output: {
      proposed: true,
      shown_to_player: 'A license refresh preview. Nothing changes until the player taps "Refresh licenses".',
    },
  };
};

const startAccountRecoveryTool: ToolHandler = async function* (_input, ctx) {
  yield statusEvent('Checking your recent sign-in attempt…');
  await pause(ctx.signal);
  const session = await getRecoverySession(ctx.signInAttempt());
  const policyMarker = ctx.citations.add(policyCitation('account-recovery'));
  // Assume full verification: if the signals alone are high risk, identity checks can't help.
  const signalRisk = assessRecoveryRisk({ ...session, verifiedFactors: MIN_VERIFIED_FACTORS + 1 });
  if (signalRisk.level === 'high') {
    // Policy before model: high risk always goes to a person, with zero account changes.
    const { request } = ctx;
    yield* handOff(
      takeoverCaseDraft(session, signalRisk.reasons, request.history, request.context),
      request.context,
      ctx.signal,
    );
    return {
      output: {
        risk: 'high',
        reasons: signalRisk.reasons,
        handed_off_to_advisor: true,
        account_changes: 'none',
        policy_marker: policyMarker,
      },
    };
  }
  yield {
    type: 'card',
    id: nextEventId(),
    level: 'L2',
    card: { type: 'identity_check', sessionId: session.id },
  } satisfies AgentEvent;
  return {
    output: {
      risk: 'low',
      sign_in_attempt: `${session.device}, ${session.location}`,
      shown_to_player:
        'Identity checks (an emailed code and a recent purchase). The app reports when they are done and proposes the reset itself.',
      policy_marker: policyMarker,
    },
  };
};

const CASE_TITLE_LIMIT = 120;
const CASE_SUMMARY_LIMIT = 1000;

const draftCaseTool: ToolHandler = async function* (input, ctx) {
  const title = stringInput(input, 'title', CASE_TITLE_LIMIT);
  const summary = stringInput(input, 'summary', CASE_SUMMARY_LIMIT);
  const purchaseId = nullableInput(input, 'purchase_id');
  if (!title || !summary || purchaseId === undefined) return invalid('title and summary are required strings');
  const purchase = purchaseId ? findPurchase(purchaseId) : undefined;
  if (purchaseId && !purchase) return invalid('Unknown purchase_id');
  const { request } = ctx;
  const base = draftCase(request.history, request.diagnostics, request.context);
  // Evidence comes from EA's records, never from the model's text.
  const draft = purchase
    ? {
        ...base,
        title,
        summary,
        gameId: purchase.gameId,
        evidence: [
          ...base.evidence,
          `Item: ${purchase.itemName}`,
          `Order ${purchase.orderNumber}: ${formatUsd(purchase.amountUsd)} on ${formatDate(purchase.purchasedAt)}`,
          `Delivered at purchase: ${purchase.fulfilledAtPurchase ? 'yes' : 'no'}`,
        ],
      }
    : { ...base, title, summary };
  yield statusEvent('Writing up your case…');
  await pause(ctx.signal);
  yield {
    type: 'card',
    id: nextEventId(),
    level: 'L3',
    card: { type: 'case_draft', draftId: nextEventId(), draft },
  } satisfies AgentEvent;
  return {
    output: {
      drafted: true,
      shown_to_player: 'An editable case draft. It is not sent until the player taps "Send to an advisor".',
    },
  };
};

const handOffTool: ToolHandler = async function* (input, ctx) {
  const summary = stringInput(input, 'summary', CASE_SUMMARY_LIMIT);
  if (!summary) return invalid('summary is required');
  const { request } = ctx;
  const draft = { ...draftCase(request.history, request.diagnostics, request.context), summary };
  yield* handOff(draft, request.context, ctx.signal);
  return { output: { handed_off: true, advisor: draft.advisorName } };
};

export const TOOL_HANDLERS = {
  search_help_articles: searchHelpArticlesTool,
  get_known_issues: getKnownIssuesTool,
  list_purchases: listPurchasesTool,
  start_guided_diagnostics: startGuidedDiagnosticsTool,
  propose_restore: proposeRestoreTool,
  propose_license_refresh: proposeLicenseRefreshTool,
  start_account_recovery: startAccountRecoveryTool,
  draft_case: draftCaseTool,
  hand_off_to_advisor: handOffTool,
} as const satisfies Record<ToolName, ToolHandler>;
