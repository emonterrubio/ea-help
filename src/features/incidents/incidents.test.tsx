import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { setAiLayerEnabled } from '@/features/flags/aiLayer';
import { routes } from '@/routes';
import { advanceIncidents } from '@/services/ea-api/api';

const renderAt = (path: string) =>
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);

const banner = () => screen.findByRole('region', { name: /Known issue: FIFA 23 Ultimate Team matchmaking/ });

describe('known-issue banners', () => {
  it('appear on Home for the player games with status and ETA', async () => {
    renderAt('/');
    const region = await banner();
    expect(region).toHaveTextContent('Cause identified, fix in progress');
    expect(region).toHaveTextContent('Fix expected within 2 hours');
  });

  it('appear only on the affected game page', async () => {
    renderAt('/game/2');
    expect(await banner()).toBeInTheDocument();
  });

  it('do not appear on other game pages', async () => {
    renderAt('/game/1');
    await screen.findByText(/Get help for the top issues Madden NFL 23/);
    expect(screen.queryByRole('region', { name: /Known issue/ })).not.toBeInTheDocument();
  });

  it('are absent in v1', async () => {
    setAiLayerEnabled(false);
    renderAt('/');
    await screen.findByText(/how we can help\?/i);
    expect(screen.queryByRole('region', { name: /Known issue/ })).not.toBeInTheDocument();
  });

  it('notify followers when the status changes, and disappear once resolved', async () => {
    renderAt('/');
    const follow = within(await banner()).getByRole('button', { name: 'Follow this issue' });
    await userEvent.click(follow);
    expect(within(await banner()).getByRole('button', { name: 'Following' })).toHaveAttribute('aria-pressed', 'true');

    act(() => advanceIncidents());
    expect(await screen.findByText(/Update on an issue you follow/)).toBeInTheDocument();
    expect(await screen.findByText(/Fix released, monitoring\./)).toBeInTheDocument();

    act(() => advanceIncidents());
    expect(await screen.findByText(/Resolved\./)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Known issue/ })).not.toBeInTheDocument();
  });
});
