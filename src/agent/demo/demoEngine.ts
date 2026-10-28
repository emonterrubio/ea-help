import { listIncidents } from '@/services/ea-api/api';
import { createAgentCase } from '@/services/ea-api/cases';
import { INCIDENT_STATUS_LABELS, incidentExpectation } from '@/services/ea-api/incidentStatus';
import type { CaseDraftInput, Incident } from '@/services/ea-api/types';
import { advisorGreeting, detectSentiment, draftCase } from '../casework';
import { treeFor } from '../diagnostics/trees';
import type { DiagnosticResult } from '../diagnostics/types';
import { answerFor, tokenize } from '../knowledge/search';
import { AUTONOMY_LEVELS } from '../policy/autonomy';
import type { AgentContext, AgentEngine, AgentEvent, AgentRequest } from '../protocol';
import { routeIntent } from './router';
import { findScenario, type Scenario } from './scenarios';

let pacingMs = 600;

/** Delay between scripted events so status lines read as progress. Tests set 0. */
export const setDemoPacing = (ms: number): void => {
  pacingMs = ms;
};

const pause = (signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    if (pacingMs === 0) return resolve();
    const timer = setTimeout(resolve, pacingMs);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

let eventCounter = 0;
const nextId = (): string => `evt-${(eventCounter += 1)}`;

const status = (text: string): AgentEvent => ({ type: 'status', id: nextId(), text });

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

/** Flows that arrive in a later build phase describe what they will do. */
const scenarioPreview = (scenario: Scenario): AgentEvent => {
  const level = AUTONOMY_LEVELS[scenario.level];
  return {
    type: 'message',
    id: nextId(),
    level: scenario.level,
    text: `This looks like a "${scenario.title}" issue. In this prototype build the full flow arrives in Phase ${scenario.phase}. Here's what it will do: ${scenario.outcome} Highest autonomy used: ${level.level} ${level.name} (${level.playerSees.toLowerCase()}).`,
  };
};

/** Creates the case and hands it to a person, who starts from the agent's summary (L3). */
async function* handOff(draft: CaseDraftInput, context: AgentContext, signal: AbortSignal) {
  yield status('Creating your case…');
  await pause(signal);
  const created = await createAgentCase(draft);
  yield status('Connecting you with an advisor…');
  await pause(signal);
  yield {
    type: 'handoff',
    id: nextId(),
    advisorName: draft.advisorName,
    summary: draft.summary,
    caseId: created.id,
    caseNumber: created.case,
    greeting: advisorGreeting(draft, context),
  } satisfies AgentEvent;
}

/** L1: guided diagnostics from an authored decision tree for the player's game and platform. */
async function* guidedDiagnostics(text: string, context: AgentContext, signal: AbortSignal) {
  const mentioned = new Set(tokenize(text));
  const game = context.ownedGames.find((owned) =>
    tokenize(owned.title).some((token) => !/^\d+$/.test(token) && mentioned.has(token)),
  );
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
    case 'text':
    case 'scenario':
      break;
  }

  const scenario = input.kind === 'scenario' ? findScenario(input.scenarioId) : undefined;
  const text = input.kind === 'text' ? input.text : (scenario?.prompt ?? '');

  // Safety and sentiment triggers route to a person immediately, before anything else.
  if (detectSentiment([text]) === 'distressed' || (scenario?.id ?? routeIntent(text)) === 'escalate') {
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

  const scenarioId = scenario?.id ?? routeIntent(text);
  switch (scenarioId) {
    case 'known-issue':
      yield* knownIssue(text, context, signal);
      break;
    case 'diagnostics':
      yield* guidedDiagnostics(text, context, signal);
      break;
    case 'quick-answer':
    case null:
      yield* answerFromHelpContent(text, context, signal);
      break;
    default: {
      const routed = findScenario(scenarioId);
      if (routed) yield scenarioPreview(routed);
    }
  }
  yield { type: 'done' };
}

/** Scripted, deterministic engine. Runs the same UI as the live agent with no API key. */
export const demoEngine: AgentEngine = {
  mode: 'demo',
  run: runDemo,
};
