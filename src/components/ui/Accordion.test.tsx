import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from './Accordion';

describe('Accordion', () => {
  it('toggles its content and exposes aria-expanded', async () => {
    render(
      <Accordion header="Account">
        <p>Panel body</p>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'Account' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Panel body')).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();
  });
});
