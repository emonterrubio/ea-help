import type { AutonomyLevel } from '@/agent/policy/autonomy';
import type { AgentCard, AgentEvent, Citation } from '@/agent/protocol';

/** Everything the conversation log can show, in order. */
export type ConversationItem =
  | { kind: 'user'; id: string; text: string }
  | { kind: 'status'; id: string; text: string; state: 'active' | 'complete' }
  | { kind: 'message'; id: string; text: string; citations?: Citation[]; level?: AutonomyLevel }
  | { kind: 'card'; id: string; card: AgentCard; level: AutonomyLevel }
  | { kind: 'handoff'; id: string; advisorName: string; summary: string }
  | { kind: 'error'; id: string; message: string };

export interface ConversationState {
  isOpen: boolean;
  isRunning: boolean;
  items: ConversationItem[];
}

export type ConversationAction =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'user_message'; id: string; text: string }
  | { type: 'run_started' }
  | { type: 'agent_event'; event: AgentEvent }
  | { type: 'run_finished' };

export const initialConversationState: ConversationState = { isOpen: false, isRunning: false, items: [] };

const completeActiveStatuses = (items: ConversationItem[]): ConversationItem[] =>
  items.map((item) => (item.kind === 'status' && item.state === 'active' ? { ...item, state: 'complete' } : item));

const applyAgentEvent = (items: ConversationItem[], event: AgentEvent): ConversationItem[] => {
  switch (event.type) {
    case 'status':
      return [...completeActiveStatuses(items), { kind: 'status', id: event.id, text: event.text, state: 'active' }];
    case 'message':
      return [
        ...completeActiveStatuses(items),
        { kind: 'message', id: event.id, text: event.text, citations: event.citations, level: event.level },
      ];
    case 'card':
      return [...completeActiveStatuses(items), { kind: 'card', id: event.id, card: event.card, level: event.level }];
    case 'handoff':
      return [
        ...completeActiveStatuses(items),
        { kind: 'handoff', id: event.id, advisorName: event.advisorName, summary: event.summary },
      ];
    case 'error':
      return [...completeActiveStatuses(items), { kind: 'error', id: event.id, message: event.message }];
    case 'done':
      return completeActiveStatuses(items);
  }
};

export const conversationReducer = (state: ConversationState, action: ConversationAction): ConversationState => {
  switch (action.type) {
    case 'open':
      return { ...state, isOpen: true };
    case 'close':
      return { ...state, isOpen: false };
    case 'user_message':
      return { ...state, items: [...state.items, { kind: 'user', id: action.id, text: action.text }] };
    case 'run_started':
      return { ...state, isRunning: true };
    case 'agent_event':
      return { ...state, items: applyAgentEvent(state.items, action.event) };
    case 'run_finished':
      return { ...state, isRunning: false, items: completeActiveStatuses(state.items) };
  }
};

/** Player-authored text so far, oldest first (feeds the handoff summary). */
export const playerHistory = (items: readonly ConversationItem[]): string[] =>
  items.flatMap((item) => (item.kind === 'user' ? [item.text] : []));
