import { listIncidents } from '@/services/ea-api/api';
import { INCIDENT_STATUS_LABELS, incidentExpectation } from '@/services/ea-api/incidentStatus';
import type { Incident } from '@/services/ea-api/types';
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

const handoffEvent = (request: AgentRequest): AgentEvent => {
  const lastIssue = request.history.at(-1);
  return {
    type: 'handoff',
    id: nextId(),
    advisorName: 'Jordan',
    summary: lastIssue
      ? `${request.context.playerName} (${request.context.platform}) asked for help with: "${lastIssue}".`
      : `${request.context.playerName} (${request.context.platform}) asked to talk to a person.`,
  };
};

async function* runDemo(request: AgentRequest, signal: AbortSignal): AsyncGenerator<AgentEvent> {
  const { input, context } = request;

  if (input.kind === 'talk_to_person') {
    yield status('Summarizing our conversation for an advisor…');
    await pause(signal);
    yield handoffEvent(request);
    yield { type: 'done' };
    return;
  }

  const scenario = input.kind === 'scenario' ? findScenario(input.scenarioId) : undefined;
  const text = input.kind === 'text' ? input.text : (scenario?.prompt ?? '');

  yield status('Understanding your request…');
  await pause(signal);

  const scenarioId = scenario?.id ?? routeIntent(text);
  switch (scenarioId) {
    case 'known-issue':
      yield* knownIssue(text, context, signal);
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
