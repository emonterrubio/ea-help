import type { CaseDraftInput, Sentiment } from '@/services/ea-api/types';
import type { DiagnosticResult } from './diagnostics/types';
import type { AgentContext } from './protocol';

export const ADVISOR_NAME = 'Jordan';

const DISTRESS = /\b(hopeless|scared|unsafe|threat|harass|self[- ]harm)/i;
const FRUSTRATION = /\b(third time|again|frustrat|angry|ridiculous|useless|real person|actual person)\b|!{2,}/i;

/** Rough sentiment so advisors know how the player is feeling (and safety can escalate). */
export const detectSentiment = (texts: readonly string[]): Sentiment => {
  const joined = texts.join(' ');
  if (DISTRESS.test(joined)) return 'distressed';
  if (FRUSTRATION.test(joined)) return 'frustrated';
  return 'calm';
};

const OUTCOME_LABELS = { done: 'fixed it', skipped: 'skipped', failed: "didn't work" } as const;

export const describeSteps = (diagnostics: readonly DiagnosticResult[]): string[] =>
  diagnostics.flatMap((result) => result.log.map((entry) => `${entry.title}: ${OUTCOME_LABELS[entry.outcome]}`));

const gameMentioned = (texts: readonly string[], context: AgentContext): string | null => {
  const joined = texts.join(' ').toLowerCase();
  const game = context.ownedGames.find((owned) =>
    owned.title
      .toLowerCase()
      .split(/\s+/)
      .some((word) => word.length > 3 && !/^\d+$/.test(word) && joined.includes(word)),
  );
  return game?.id ?? null;
};

/**
 * Drafts a case from everything the player already told the agent, so nobody has
 * to repeat it (and the player is never asked for screenshots).
 */
export const draftCase = (
  history: readonly string[],
  diagnostics: readonly DiagnosticResult[],
  context: AgentContext,
): CaseDraftInput => {
  const latest = diagnostics.at(-1);
  const issue = history[0] ?? 'Asked to talk to a person';
  const gameId = gameMentioned(history, context);
  const gameTitle = context.ownedGames.find((game) => game.id === gameId)?.title;
  const evidence = [
    `Platform: ${context.platform} (${context.region})`,
    ...(gameTitle ? [`Game: ${gameTitle}`] : []),
    ...(latest ? latest.answers.map(({ question, answer }) => `${question} ${answer}`) : []),
  ];
  const stepsTried = describeSteps(diagnostics);
  const title = latest?.treeTitle ?? issue;

  return {
    title,
    summary: [
      `${context.playerName} reported: "${issue}".`,
      stepsTried.length > 0
        ? `Tried ${stepsTried.length} guided troubleshooting steps on ${context.platform}; none resolved it.`
        : 'No troubleshooting completed yet.',
    ].join(' '),
    gameId,
    evidence,
    stepsTried,
    sentiment: detectSentiment(history),
    transcript: [...history],
    advisorName: ADVISOR_NAME,
  };
};

/** The advisor's first line, written from the agent's summary (warm handoff). */
export const advisorGreeting = (draft: CaseDraftInput, context: AgentContext): string => {
  const firstName = context.playerName.split(' ')[0] ?? context.playerName;
  const tried =
    draft.stepsTried.length > 0
      ? `and the ${draft.stepsTried.length} steps you already tried on your ${context.platform}`
      : `and everything you told the Help Agent`;
  return `Hi ${firstName}, I'm ${draft.advisorName}. I've read your case ${tried}, so we'll pick up from there.`;
};
