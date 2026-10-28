import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { setAiLayerEnabled } from '@/features/flags/aiLayer';
import { routes } from '@/routes';

const renderAt = (path: string) =>
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);

const openAgent = async () => {
  await userEvent.click(await screen.findByRole('button', { name: 'Ask the Help Agent' }));
  return screen.findByRole('dialog', { name: /ea help agent/i });
};

describe('Help Agent', () => {
  it('opens, identifies as AI and greets with account context', async () => {
    renderAt('/');
    const dialog = await openAgent();
    expect(await within(dialog).findByText(/I'm the EA Help Agent, an AI assistant/)).toBeInTheDocument();
    expect(within(dialog).getByText('PS5')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Talk to a person' })).toBeInTheDocument();
  });

  it('answers a typed message with narrated progress', async () => {
    renderAt('/');
    const dialog = await openAgent();
    await within(dialog).findByText(/an AI assistant/);
    await userEvent.type(
      within(dialog).getByLabelText('Describe your issue'),
      'Battlefield 2042 keeps crashing on my PS5{Enter}',
    );
    expect(await within(dialog).findByText('Battlefield 2042 keeps crashing on my PS5')).toBeInTheDocument();
    expect(await within(dialog).findByRole('region', { name: /Guided troubleshooting/ })).toBeInTheDocument();
    expect(within(dialog).getByText('Understanding your request…')).toBeInTheDocument();
  });

  it('hands off to a person with the conversation summary', async () => {
    renderAt('/');
    const dialog = await openAgent();
    await within(dialog).findByText(/an AI assistant/);
    await userEvent.type(within(dialog).getByLabelText('Describe your issue'), 'My pack never arrived{Enter}');
    await within(dialog).findByText('My pack never arrived');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Talk to a person' }));
    const handoff = await within(dialog).findByRole('region', { name: 'Handoff to an advisor' });
    expect(handoff).toHaveTextContent('My pack never arrived');
  });

  it('closes with the close button', async () => {
    renderAt('/');
    const dialog = await openAgent();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close Help Agent' }));
    expect(await screen.findByRole('button', { name: 'Ask the Help Agent' })).toBeInTheDocument();
  });

  it('runs a deep-linked scenario', async () => {
    renderAt('/?scenario=known-issue');
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    expect(await within(dialog).findByText("FIFA 23 matchmaking won't connect")).toBeInTheDocument();
    expect(await within(dialog).findByText(/Known issue/)).toBeInTheDocument();
    expect(within(dialog).queryByText('Try asking')).not.toBeInTheDocument();
  });

  it('is absent when the AI layer is off (v1)', async () => {
    setAiLayerEnabled(false);
    renderAt('/');
    expect(await screen.findByText(/how we can help\?/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ask the help agent/i })).not.toBeInTheDocument();
  });
});
