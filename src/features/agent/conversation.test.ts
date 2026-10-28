import { conversationReducer, initialConversationState, playerHistory } from './conversation';

describe('conversationReducer', () => {
  it('completes the previous status when a new event arrives', () => {
    let state = conversationReducer(initialConversationState, {
      type: 'agent_event',
      event: { type: 'status', id: 's1', text: 'Checking…' },
    });
    state = conversationReducer(state, { type: 'agent_event', event: { type: 'message', id: 'm1', text: 'Done' } });
    expect(state.items).toEqual([
      { kind: 'status', id: 's1', text: 'Checking…', state: 'complete' },
      { kind: 'message', id: 'm1', text: 'Done', citations: undefined, level: undefined },
    ]);
  });

  it('completes any active status when a run finishes', () => {
    let state = conversationReducer(initialConversationState, { type: 'run_started' });
    state = conversationReducer(state, { type: 'agent_event', event: { type: 'status', id: 's1', text: 'Working' } });
    state = conversationReducer(state, { type: 'run_finished' });
    expect(state.isRunning).toBe(false);
    expect(state.items[0]).toMatchObject({ state: 'complete' });
  });

  it('extracts the player history in order', () => {
    let state = conversationReducer(initialConversationState, { type: 'user_message', id: 'u1', text: 'first' });
    state = conversationReducer(state, { type: 'agent_event', event: { type: 'message', id: 'm', text: 'reply' } });
    state = conversationReducer(state, { type: 'user_message', id: 'u2', text: 'second' });
    expect(playerHistory(state.items)).toEqual(['first', 'second']);
  });
});
