import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { setAiLayerEnabled } from '@/features/flags/aiLayer';
import { routes } from '@/routes';

const renderHome = () => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/'] })} />);

const typeInSearch = async (text: string) => {
  const input = await screen.findByRole('combobox', { name: 'How can we help?' });
  await userEvent.type(input, text);
};

describe('answer-first search', () => {
  it('shows a cited answer above the results', async () => {
    renderHome();
    await typeInSearch('turn on login verification');
    const answer = await screen.findByRole('region', { name: 'Suggested answer' });
    expect(answer).toHaveTextContent('Source: How to turn on EA Login Verification');
  });

  it('offers the Help Agent, pre-filled, when nothing matches', async () => {
    renderHome();
    await typeInSearch('zqxv blorp');
    await userEvent.click(await screen.findByRole('button', { name: 'Ask the Help Agent about this search' }));
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    expect(within(dialog).getByLabelText('Describe your issue')).toHaveValue('zqxv blorp');
  });

  it('is absent in v1', async () => {
    setAiLayerEnabled(false);
    renderHome();
    await typeInSearch('turn on login verification');
    expect(screen.queryByRole('region', { name: 'Suggested answer' })).not.toBeInTheDocument();
  });
});
