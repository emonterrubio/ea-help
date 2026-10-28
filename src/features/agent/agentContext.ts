import { createContext, useContext } from 'react';
import type { AgentContext, AgentMode } from '@/agent/protocol';
import type { ScenarioId } from '@/agent/demo/scenarios';
import { getPlayerProfile, listIncidents, listOwnedGames } from '@/services/ea-api/api';
import type { ConversationState } from './conversation';

export interface HelpAgentApi {
  state: ConversationState;
  mode: AgentMode;
  /** Loaded before the first reply; `null` until then. */
  context: AgentContext | null;
  open: (options?: { scenarioId?: ScenarioId; prefill?: string }) => void;
  close: () => void;
  send: (text: string) => void;
  talkToPerson: () => void;
  /** Text to place in the composer when the panel opens (e.g. a search query). */
  prefill: string;
}

export const HelpAgentContext = createContext<HelpAgentApi | null>(null);

export const useHelpAgent = (): HelpAgentApi => {
  const api = useContext(HelpAgentContext);
  if (!api) throw new Error('useHelpAgent must be used inside <HelpAgentProvider>');
  return api;
};

/** Account context the agent knows before the player types anything. */
export const loadAgentContext = async (): Promise<AgentContext> => {
  const [player, ownedGames, incidents] = await Promise.all([getPlayerProfile(), listOwnedGames(), listIncidents()]);
  return {
    playerName: player.displayName,
    platform: player.platform,
    region: player.region,
    ownedGames: ownedGames.map((game) => ({ id: game.id, title: game.title })),
    activeIncidentIds: incidents.map((incident) => incident.id),
  };
};

export const introMessage = (context: AgentContext): string => {
  const firstName = context.playerName.split(' ')[0] ?? context.playerName;
  const issues =
    context.activeIncidentIds.length > 0
      ? `, plus ${context.activeIncidentIds.length} known issue affecting one of them`
      : '';
  return `Hi ${firstName}. I'm the EA Help Agent, an AI assistant. I can already see your ${context.ownedGames.length} games on ${context.platform}${issues}, so you won't need to repeat any of that. Tell me what's going on in your own words. I'll show you what I'm checking and ask before I change anything on your account. You can talk to a person at any time.`;
};
