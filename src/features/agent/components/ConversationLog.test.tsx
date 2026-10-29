import { render, screen } from '@testing-library/react';
import type { ConversationItem } from '../conversation';
import { ConversationLog } from './ConversationLog';

const reply: ConversationItem = { kind: 'message', id: 'm1', text: 'Here is a restore preview.', level: 'L2' };
const checking: ConversationItem = { kind: 'status', id: 's1', text: 'Checking your purchases…', state: 'active' };

describe('ConversationLog working indicator', () => {
  it('fills the quiet gap while the agent writes its next reply', () => {
    render(<ConversationLog items={[reply]} isRunning />);
    expect(screen.getByText('Working on it…')).toBeInTheDocument();
  });

  it('stays out of the way of an active status line and of finished runs', () => {
    const { rerender } = render(<ConversationLog items={[reply, checking]} isRunning />);
    expect(screen.queryByText('Working on it…')).not.toBeInTheDocument();
    rerender(<ConversationLog items={[reply]} isRunning={false} />);
    expect(screen.queryByText('Working on it…')).not.toBeInTheDocument();
  });

  it('is not announced, since screen readers already hear the status lines', () => {
    render(<ConversationLog items={[reply]} isRunning />);
    expect(screen.getByText('Working on it…').closest('li')).toHaveAttribute('aria-hidden', 'true');
  });
});
