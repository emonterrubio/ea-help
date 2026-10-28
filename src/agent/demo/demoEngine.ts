import { AUTONOMY_LEVELS } from '../policy/autonomy';
import type { AgentEngine, AgentEvent, AgentRequest } from '../protocol';
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

const scenarioPreview = (scenario: Scenario): AgentEvent => {
  const level = AUTONOMY_LEVELS[scenario.level];
  return {
    type: 'message',
    id: nextId(),
    level: scenario.level,
    text: `This looks like a "${scenario.title}" issue. In this prototype build the full flow arrives in Phase ${scenario.phase}. Here's what it will do: ${scenario.outcome} Highest autonomy used: ${level.level} ${level.name} (${level.playerSees.toLowerCase()}).`,
  };
};

const fallbackMessage = (): AgentEvent => ({
  type: 'message',
  id: nextId(),
  level: 'L0',
  text: 'I couldn\'t match that to something I can help with yet. Try one of the suggestions, or tap "Talk to a person" and I\'ll hand you to an advisor with this conversation attached.',
});

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
  const { input } = request;

  if (input.kind === 'talk_to_person') {
    yield { type: 'status', id: nextId(), text: 'Summarizing our conversation for an advisor…' };
    await pause(signal);
    yield handoffEvent(request);
    yield { type: 'done' };
    return;
  }

  yield { type: 'status', id: nextId(), text: 'Understanding your request…' };
  await pause(signal);

  const scenarioId = input.kind === 'scenario' ? input.scenarioId : routeIntent(input.text);
  const scenario = scenarioId ? findScenario(scenarioId) : undefined;
  yield scenario ? scenarioPreview(scenario) : fallbackMessage();
  yield { type: 'done' };
}

/** Scripted, deterministic engine. Runs the same UI as the live agent with no API key. */
export const demoEngine: AgentEngine = {
  mode: 'demo',
  run: runDemo,
};
