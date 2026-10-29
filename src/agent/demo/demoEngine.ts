import {
  entitlementStatusFor,
  getEntitlementStatus,
  getPlayerProfile,
  listGrants,
  listIncidents,
  listPurchases,
} from '@/services/ea-api/api';
import { INCIDENT_STATUS_LABELS, incidentExpectation } from '@/services/ea-api/incidentStatus';
import {
  DEMO_RECOVERY_SESSIONS,
  FACTOR_LABELS,
  getRecoverySession,
  verifiedFactorsFor,
} from '@/services/ea-api/security';
import type { Incident, Purchase, RecoverySession } from '@/services/ea-api/types';
import { runConfirmedAction } from '../actions/confirm';
import { detectSentiment, draftCase, draftReviewCase, takeoverCaseDraft } from '../casework';
import { treeFor } from '../diagnostics/trees';
import { handOff } from '../handoff';
import type { DiagnosticResult } from '../diagnostics/types';
import { answerFor, tokenize } from '../knowledge/search';
import { evaluateRestoreEligibility } from '../policy/eligibility';
import { policyCitation } from '../policy/policies';
import { assessRecoveryRisk, MIN_VERIFIED_FACTORS } from '../policy/risk';
import { nextEventId, pause, statusEvent } from '../pacing';
import { formatDate, formatUsd, licenseRefreshPreview, restorePreview } from '../previews';
import type { AgentContext, AgentEngine, AgentEvent, AgentRequest } from '../protocol';
import { routeIntent } from './router';
import { findScenario } from './scenarios';

export { setDemoPacing } from '../pacing';

const nextId = nextEventId;
const status = statusEvent;

const ownedTitles = (context: AgentContext): string[] => context.ownedGames.map((game) => game.title);

/** L0: a short answer built only from approved help content, with its source cited. */
async function* answerFromHelpContent(text: string, context: AgentContext, signal: AbortSignal) {
  yield status('Searching EA Help articles…');
  await pause(signal);
  const answer = answerFor(text, { gameTitles: ownedTitles(context) });
  if (!answer) {
    yield {
      type: 'message',
      id: nextId(),
      level: 'L0',
      text: "I couldn't find an approved EA Help answer for that, so I won't guess. Try describing it another way, or tap \"Talk to a person\" and I'll pass this conversation to an advisor.",
    } satisfies AgentEvent;
    return;
  }
  yield {
    type: 'message',
    id: nextId(),
    level: 'L0',
    text: `${answer.text} Did that answer your question?`,
    citations: [{ kind: 'article', articleId: answer.article.id, title: answer.article.title }],
  } satisfies AgentEvent;
}

/** Picks the incident whose game the player mentioned, else the first one. */
const incidentForText = (incidents: Incident[], text: string, context: AgentContext): Incident | undefined => {
  const mentioned = new Set(tokenize(text));
  const byGame = incidents.find((incident) => {
    const title = context.ownedGames.find((game) => game.id === incident.gameId)?.title ?? '';
    return tokenize(title).some((token) => !/^\d+$/.test(token) && mentioned.has(token));
  });
  return byGame ?? incidents[0];
};

/** L0: proactive status. The agent informs; it cannot fix server-side incidents. */
async function* knownIssue(text: string, context: AgentContext, signal: AbortSignal) {
  yield status('Checking live service status for your games…');
  await pause(signal);
  const incidents = await listIncidents(context.ownedGames.map((game) => game.id));
  const incident = incidentForText(incidents, text, context);
  if (!incident) {
    yield {
      type: 'message',
      id: nextId(),
      level: 'L0',
      text: "I don't see any active issues for your games right now, so this may be specific to your setup.",
    } satisfies AgentEvent;
    yield* answerFromHelpContent('connection troubleshooting help', context, signal);
    return;
  }
  yield {
    type: 'message',
    id: nextId(),
    level: 'L0',
    text: [
      "Good news: it's not your setup. This is a known issue and EA is on it.",
      `Status: ${INCIDENT_STATUS_LABELS[incident.status].toLowerCase()}.`,
      `${incidentExpectation(incident.status, incident.eta) ?? ''}.`,
      "Follow it and I'll let you know as soon as the status changes.",
    ].join(' '),
    citations: [{ kind: 'incident', incidentId: incident.id, label: 'EA service status' }],
  } satisfies AgentEvent;
  yield {
    type: 'card',
    id: nextId(),
    level: 'L0',
    card: { type: 'incident', incidentId: incident.id },
  } satisfies AgentEvent;
}

/** The owned game the player named, matched on title words (not numbers like "23"). */
const mentionedGame = (text: string, context: AgentContext) => {
  const mentioned = new Set(tokenize(text));
  return context.ownedGames.find((owned) =>
    tokenize(owned.title).some((token) => !/^\d+$/.test(token) && mentioned.has(token)),
  );
};

/** L1: guided diagnostics from an authored decision tree for the player's game and platform. */
async function* guidedDiagnostics(text: string, context: AgentContext, signal: AbortSignal) {
  const game = mentionedGame(text, context);
  const tree = game ? treeFor(game.id, context.platform) : undefined;
  if (!game || !tree) {
    yield {
      type: 'message',
      id: nextId(),
      level: 'L0',
      text: game
        ? `I don't have guided steps for ${game.title} on ${context.platform} yet, so I won't make any up. Tap "Talk to a person" and I'll pass this to an advisor.`
        : 'Which game is it? For example: "Battlefield 2042 keeps crashing on my PS5."',
    } satisfies AgentEvent;
    return;
  }
  yield status(`Checking your ${game.title} setup on ${context.platform}…`);
  await pause(signal);
  yield {
    type: 'message',
    id: nextId(),
    level: 'L1',
    text: `You're playing ${game.title} on ${context.platform}, so I'll skip the generic advice. Two quick questions, then steps written for ${context.platform}. If a step doesn't work, say so and I'll move on.`,
  } satisfies AgentEvent;
  yield { type: 'card', id: nextId(), level: 'L1', card: { type: 'diagnostic', treeId: tree.id } } satisfies AgentEvent;
}

/** After the steps: celebrate a fix, or draft a case with the full diagnostic log. */
async function* diagnosticOutcome(result: DiagnosticResult, request: AgentRequest, signal: AbortSignal) {
  if (result.outcome === 'resolved') {
    const fix = result.log.find((entry) => entry.outcome === 'done');
    yield {
      type: 'message',
      id: nextId(),
      level: 'L1',
      text: `Great, glad that's sorted.${fix ? ` I noted that "${fix.title}" fixed it, in case it comes back.` : ''}`,
    } satisfies AgentEvent;
    return;
  }
  yield status('Writing up your case with everything you tried…');
  await pause(signal);
  const draft = draftCase(request.history, [...request.diagnostics, result], request.context);
  yield {
    type: 'message',
    id: nextId(),
    level: 'L3',
    text: "I've run out of fixes I'm allowed to suggest, so this needs a person. I drafted the case with your answers and every step you tried, so you won't have to repeat anything. Review it, change anything you like, then send it.",
  } satisfies AgentEvent;
  yield {
    type: 'card',
    id: nextId(),
    level: 'L3',
    card: { type: 'case_draft', draftId: nextId(), draft },
  } satisfies AgentEvent;
}

/** Newest undelivered, unrefunded purchase first; otherwise the newest purchase. */
const purchaseInQuestion = (purchases: Purchase[], grants: Awaited<ReturnType<typeof listGrants>>) => {
  const newestFirst = [...purchases].sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  return (
    newestFirst.find(
      (purchase) => entitlementStatusFor(purchase, grants) === 'missing' && purchase.refundStatus === 'none',
    ) ?? newestFirst[0]
  );
};

/**
 * Instant Content Recovery. The agent verifies the purchase and the entitlement (L0);
 * the rules engine decides between an instant restore (L2), a license refresh, or review (L3).
 */
async function* contentRecovery(text: string, request: AgentRequest, signal: AbortSignal) {
  const { context } = request;
  const game = mentionedGame(text, context);
  yield status(game ? `Checking your ${game.title} purchases…` : 'Checking your recent purchases…');
  await pause(signal);
  const [purchases, grants] = await Promise.all([listPurchases(game?.id), listGrants()]);
  const purchase = purchaseInQuestion(purchases, grants);
  if (!purchase) {
    yield {
      type: 'message',
      id: nextId(),
      level: 'L0',
      text: `I don't see a${game ? ` ${game.title}` : ''} purchase on your EA account, so I won't guess. If you bought it from another store, tap "Talk to a person" and an advisor can look it up.`,
    } satisfies AgentEvent;
    return;
  }
  const gameTitle = context.ownedGames.find((owned) => owned.id === purchase.gameId)?.title ?? 'your game';
  yield status(`Checking whether it reached your account…`);
  await pause(signal);
  const entitlement = await getEntitlementStatus(purchase.id);
  const decision = evaluateRestoreEligibility({
    purchase,
    entitlementGranted: entitlement === 'granted',
    grants,
    now: new Date(),
  });
  const order = `order ${purchase.orderNumber}, ${formatUsd(purchase.amountUsd)}`;
  const purchaseCitation = {
    kind: 'purchase' as const,
    purchaseId: purchase.id,
    label: `Order ${purchase.orderNumber}`,
  };

  switch (decision.outcome) {
    case 'eligible':
      yield {
        type: 'message',
        id: nextId(),
        level: 'L2',
        text: `Found it. You bought ${purchase.itemName} on ${formatDate(purchase.purchasedAt)} (${order}), but it never reached your account. It qualifies for an instant restore. Here's exactly what will change. Nothing happens until you confirm.`,
        citations: [purchaseCitation, policyCitation('instant-restore')],
      } satisfies AgentEvent;
      yield {
        type: 'card',
        id: nextId(),
        level: 'L2',
        card: restorePreview(purchase, gameTitle),
      } satisfies AgentEvent;
      return;
    case 'not_needed':
      yield {
        type: 'message',
        id: nextId(),
        level: 'L1',
        text: `${purchase.itemName} (${order}) is already on your account. If it isn't showing in ${gameTitle}, refreshing your licenses usually brings it back. I can do that for you.`,
        citations: [purchaseCitation],
      } satisfies AgentEvent;
      yield {
        type: 'card',
        id: nextId(),
        level: 'L2',
        card: licenseRefreshPreview(purchase.gameId, gameTitle, purchase.platform),
      } satisfies AgentEvent;
      return;
    case 'review': {
      yield {
        type: 'message',
        id: nextId(),
        level: 'L3',
        text: `I found your purchase of ${purchase.itemName} (${order}), and it never reached your account. I can't restore this one myself: ${decision.reasons.join(' ')} I drafted a case with the order details attached, so an advisor can fix it without asking you for screenshots or receipts.`,
        citations: [purchaseCitation, policyCitation('instant-restore')],
      } satisfies AgentEvent;
      const draft = draftReviewCase({
        title: `Missing purchase: ${purchase.itemName}`,
        finding: `Purchase verified (order ${purchase.orderNumber}) but never delivered. Automatic restore isn't allowed, so it needs an advisor.`,
        gameId: purchase.gameId,
        evidence: [
          `Item: ${purchase.itemName}`,
          `Order ${purchase.orderNumber}: ${formatUsd(purchase.amountUsd)} on ${formatDate(purchase.purchasedAt)}`,
          'Delivered at purchase: no',
          ...decision.reasons.map((reason) => `Review reason: ${reason}`),
        ],
        history: request.history,
        context,
      });
      yield {
        type: 'card',
        id: nextId(),
        level: 'L3',
        card: { type: 'case_draft', draftId: nextId(), draft },
      } satisfies AgentEvent;
      return;
    }
  }
}

/** High risk caps autonomy at L3: no change is applied, and a person takes over. */
async function* securityHandoff(
  session: RecoverySession,
  reasons: string[],
  request: AgentRequest,
  signal: AbortSignal,
) {
  yield {
    type: 'message',
    id: nextId(),
    level: 'L3',
    text: `I'm treating this as a possible account takeover, so I won't change anything from this chat, and nothing on your account has been changed. Here's what I found: ${reasons.join('; ')}. I'm passing this to an advisor now with everything I checked.`,
    citations: [policyCitation('account-recovery')],
  } satisfies AgentEvent;
  yield* handOff(takeoverCaseDraft(session, reasons, request.history, request.context), request.context, signal);
}

/**
 * Secure Account Recovery. Risk signals are checked first: any hard signal goes straight
 * to a person. Otherwise the player passes identity checks before a reset is proposed.
 */
async function* accountRecovery(sessionId: string, request: AgentRequest, signal: AbortSignal) {
  yield status('Checking your recent sign-in attempt…');
  await pause(signal);
  const session = await getRecoverySession(sessionId);
  // Assume full verification: if the signals alone are high risk, identity checks can't help.
  const signalRisk = assessRecoveryRisk({ ...session, verifiedFactors: MIN_VERIFIED_FACTORS + 1 });
  if (signalRisk.level === 'high') {
    yield* securityHandoff(session, signalRisk.reasons, request, signal);
    return;
  }
  yield {
    type: 'message',
    id: nextId(),
    level: 'L2',
    text: `I can help you get back in. Your sign-in attempt came from your usual ${session.device} in ${session.location}, which is a good sign. First I need to confirm it's you. I'll never ask for your password. Two quick checks:`,
    citations: [policyCitation('account-recovery')],
  } satisfies AgentEvent;
  yield { type: 'card', id: nextId(), level: 'L2', card: { type: 'identity_check', sessionId } } satisfies AgentEvent;
}

/** After identity checks: re-assess risk, then propose the reset (L2) or hand off (L3). */
async function* afterVerification(sessionId: string, request: AgentRequest, signal: AbortSignal) {
  yield status('Checking your identity checks and risk signals…');
  await pause(signal);
  const [session, player] = await Promise.all([getRecoverySession(sessionId), getPlayerProfile()]);
  const factors = verifiedFactorsFor(sessionId);
  const risk = assessRecoveryRisk({ ...session, verifiedFactors: factors.length });
  if (risk.level === 'high') {
    yield* securityHandoff(session, risk.reasons, request, signal);
    return;
  }
  yield {
    type: 'message',
    id: nextId(),
    level: 'L2',
    text: `Thanks, that's you. Risk check: low (${factors.length} identity checks passed, usual device and region, no recent email change). Here's what I'll change. Nothing happens until you confirm.`,
  } satisfies AgentEvent;
  yield {
    type: 'card',
    id: nextId(),
    level: 'L2',
    card: {
      type: 'action_preview',
      actionId: nextId(),
      action: { kind: 'reset_credentials', sessionId },
      title: 'Reset your password',
      details: [
        { label: 'Account', value: player.maskedEmail },
        { label: 'Sign-in attempt', value: `${session.device}, ${session.location}` },
        { label: 'Identity checks', value: factors.map((factor) => FACTOR_LABELS[factor]).join(', ') },
      ],
      changes: [
        `Email a password reset link to ${player.maskedEmail}`,
        'Sign out every other device',
        'Keep your games, progress and purchases as they are',
      ],
      confirmLabel: 'Reset password',
    },
  } satisfies AgentEvent;
}

async function* runDemo(request: AgentRequest, signal: AbortSignal): AsyncGenerator<AgentEvent> {
  const { input, context } = request;

  switch (input.kind) {
    case 'talk_to_person':
      yield status('Summarizing our conversation for an advisor…');
      await pause(signal);
      yield* handOff(draftCase(request.history, request.diagnostics, context), context, signal);
      yield { type: 'done' };
      return;
    case 'submit_case':
      yield* handOff(input.draft, context, signal);
      yield { type: 'done' };
      return;
    case 'diagnostic_result':
      yield* diagnosticOutcome(input.result, request, signal);
      yield { type: 'done' };
      return;
    case 'identity_verified':
      yield* afterVerification(input.sessionId, request, signal);
      yield { type: 'done' };
      return;
    case 'confirm_action':
      // The provider runs confirmations in the browser; delegated here for completeness.
      yield* runConfirmedAction(request, signal);
      return;
    case 'text':
    case 'scenario':
      break;
  }

  const scenario = input.kind === 'scenario' ? findScenario(input.scenarioId) : undefined;
  const text = input.kind === 'text' ? input.text : (scenario?.prompt ?? '');

  const scenarioId = scenario?.id ?? routeIntent(text);

  // Safety and sentiment triggers route to a person immediately, before anything else.
  if (detectSentiment([text]) === 'distressed' || scenarioId === 'escalate') {
    yield {
      type: 'message',
      id: nextId(),
      level: 'L3',
      text: "I'm sorry this has been so frustrating. I'm getting you to a person right now and passing along everything so far, so you won't have to explain it again.",
    } satisfies AgentEvent;
    yield* handOff(draftCase(request.history, request.diagnostics, context), context, signal);
    yield { type: 'done' };
    return;
  }

  yield status('Understanding your request…');
  await pause(signal);

  switch (scenarioId) {
    case 'known-issue':
      yield* knownIssue(text, context, signal);
      break;
    case 'diagnostics':
      yield* guidedDiagnostics(text, context, signal);
      break;
    case 'content-recovery':
    case 'content-review':
      // The route only says "missing purchase"; the rules engine decides restore or review.
      yield* contentRecovery(text, request, signal);
      break;
    case 'account-recovery':
      yield* accountRecovery(DEMO_RECOVERY_SESSIONS.usualDevice, request, signal);
      break;
    case 'account-recovery-risky':
      yield* accountRecovery(DEMO_RECOVERY_SESSIONS.newDevice, request, signal);
      break;
    case 'quick-answer':
    case null:
      yield* answerFromHelpContent(text, context, signal);
      break;
  }
  yield { type: 'done' };
}

/** Scripted, deterministic engine. Runs the same UI as the live agent with no API key. */
export const demoEngine: AgentEngine = {
  mode: 'demo',
  run: runDemo,
};
