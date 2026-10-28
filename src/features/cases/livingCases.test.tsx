import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { setAiLayerEnabled } from '@/features/flags/aiLayer';
import { routes } from '@/routes';

const renderAt = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
};

describe('guided diagnostics to a living case', () => {
  it('runs the steps, drafts a case, hands off, and shows the case in My Cases', async () => {
    const router = renderAt('/?scenario=diagnostics');
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    const card = await within(dialog).findByRole('region', { name: /Guided troubleshooting/ });

    await userEvent.click(within(card).getByLabelText('During multiplayer matches'));
    await userEvent.click(within(card).getByLabelText('No, it just closes'));
    await userEvent.click(within(card).getByRole('button', { name: 'Start troubleshooting' }));
    for (let step = 0; step < 4; step += 1) {
      await userEvent.click(within(card).getByRole('button', { name: "That didn't work" }));
    }

    const draft = await within(dialog).findByRole('region', { name: 'Draft case' });
    expect(draft).toHaveTextContent("Install the latest update: didn't work");
    await userEvent.clear(within(draft).getByLabelText('Summary'));
    await userEvent.type(within(draft).getByLabelText('Summary'), 'Crashes every multiplayer match.');
    await userEvent.click(within(draft).getByRole('button', { name: 'Send to an advisor' }));

    const handoff = await within(dialog).findByRole('region', { name: 'Handoff to an advisor' });
    expect(handoff).toHaveTextContent('Crashes every multiplayer match.');
    expect(handoff).toHaveTextContent("Hi Tom, I'm Jordan. I've read your case and the 4 steps");

    await userEvent.click(within(handoff).getByRole('link', { name: 'My Cases' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/cases\/active\/ai-/));
    expect(await screen.findByRole('heading', { name: 'Where your case stands' })).toBeInTheDocument();
    const timeline = screen.getByRole('region', { name: 'Case timeline' });
    expect(timeline).toHaveTextContent('Troubleshooting steps tried');

    await router.navigate('/cases/active');
    await screen.findAllByRole('button', { name: 'See details' });
    expect(screen.getByRole('heading', { name: 'Battlefield 2042 crashing on PS5' })).toBeInTheDocument();
  });

  it('shows plain status and the unified timeline on v1 cases', async () => {
    renderAt('/cases/active/1');
    expect(await screen.findByRole('heading', { name: 'Where your case stands' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Case timeline' })).toHaveTextContent('Case opened on EA Help');
  });

  it('keeps v1 case details unchanged with the AI layer off', async () => {
    setAiLayerEnabled(false);
    renderAt('/cases/active/1');
    expect(await screen.findByText('Conversation history')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Where your case stands' })).not.toBeInTheDocument();
  });
});
