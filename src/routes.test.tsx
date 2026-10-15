import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from './routes';

const renderAt = async (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
};

describe('routes', () => {
  it.each([
    ['/', /how we can help\?/i],
    ['/cases/active', 'View and manage all your help cases'],
    ['/cases/history', 'Cases History'],
    ['/cases/active/2', 'Need more help with this issue?'],
    ['/infractions/active', 'View your active and past bans and suspensions'],
    ['/infractions/history/3', 'Infraction Details'],
    ['/account', 'Self-help Tools'],
    ['/topic/safety', 'Player Safety Support'],
    ['/game/1', /Get help for the top issues Madden NFL 23/],
    ['/games', 'View by:'],
    ['/eagames', 'adventure'],
  ])('renders %s', async (path, text) => {
    await renderAt(path);
    expect(await screen.findByText(text)).toBeInTheDocument();
  });

  it('renders topic pages that have no articles (legacy crashed here)', async () => {
    await renderAt('/topic/password');
    expect(await screen.findByText('Password Support')).toBeInTheDocument();
  });

  it('renders a not-found page for unknown URLs', async () => {
    await renderAt('/does-not-exist');
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });

  it('renders a not-found message for unknown ids', async () => {
    await renderAt('/cases/active/999');
    expect(await screen.findByText(/couldn’t find that case/)).toBeInTheDocument();
  });

  it('marks only the exact primary nav item as current', async () => {
    await renderAt('/cases/history');
    await screen.findByText('Cases History');
    const current = screen.getAllByRole('link', { current: 'page' }).map((link) => link.textContent);
    expect(current).toContain('Cases History');
    expect(current).not.toContain('My Cases');
  });
});
