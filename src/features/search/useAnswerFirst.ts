import { useMemo } from 'react';
import { answerFor, type GroundedAnswer } from '@/agent/knowledge/search';
import { useOptionalHelpAgent } from '@/features/agent/agentContext';
import { useAiLayer } from '@/features/flags/aiLayer';
import { ownedGameTitles } from '@/services/ea-api/api';

/** Queries this short are still being typed; don't answer or recover yet. */
export const MIN_ANSWER_QUERY_LENGTH = 3;

export interface AnswerFirst {
  enabled: boolean;
  answer: GroundedAnswer | null;
  /** Opens the Help Agent with the query pre-filled; `null` when the agent is unavailable. */
  askAgent: (() => void) | null;
}

/**
 * Answer-first search (AI layer only): a short cited answer for the query, filtered to
 * the current game when there is one, otherwise to the player's games.
 */
export const useAnswerFirst = (query: string, gameTitle?: string): AnswerFirst => {
  const enabled = useAiLayer();
  const agent = useOptionalHelpAgent();
  const trimmed = query.trim();

  const answer = useMemo(() => {
    if (!enabled || trimmed.length < MIN_ANSWER_QUERY_LENGTH) return null;
    return answerFor(trimmed, { gameTitles: gameTitle ? [gameTitle] : ownedGameTitles() });
  }, [enabled, trimmed, gameTitle]);

  return {
    enabled,
    answer,
    askAgent: enabled && agent ? () => agent.open({ prefill: trimmed }) : null,
  };
};
