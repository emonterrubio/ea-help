import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { ModelTurn } from '@/agent/live/transport';
import { routes } from '@/routes';
import { setAgentEnginePreference } from './agentEngine';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Fakes /api/agent: the status check, then one scripted reply (or error) per model turn. */
const stubAgentApi = ({ live, turns }: { live: boolean; turns: (ModelTurn | Response)[] }) => {
  const posts: unknown[] = [];
  const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method !== 'POST') return json({ live });
    posts.push(JSON.parse(String(init.body)));
    const next = turns.shift();
    if (!next) return json({ reason: 'upstream' }, 502);
    return next instanceof Response ? next : json(next);
  });
  vi.stubGlobal('fetch', fetchMock);
  return posts;
};

const renderScenario = (scenario: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [`/?scenario=${scenario}`] });
  render(<RouterProvider router={router} />);
};

describe('hybrid live mode', () => {
  beforeEach(() => setAgentEnginePreference('auto'));
  afterEach(() => vi.unstubAllGlobals());

  it('runs the live agent when the server allows it', async () => {
    const posts = stubAgentApi({
      live: true,
      turns: [
        {
          content: [{ type: 'tool_use', id: 't1', name: 'list_purchases', input: { game_id: '1' } }],
          stopReason: 'tool_use',
        },
        {
          content: [{ type: 'tool_use', id: 't2', name: 'propose_restore', input: { purchase_id: 'pur-1001' } }],
          stopReason: 'tool_use',
        },
        {
          content: [{ type: 'text', text: 'Found it [purchase:pur-1001]. Nothing changes until you confirm.' }],
          stopReason: 'end_turn',
        },
      ],
    });
    renderScenario('content-recovery');
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    expect(await within(dialog).findByRole('region', { name: /^Preview: Restore/ })).toBeInTheDocument();
    expect(await within(dialog).findByText('Found it. Nothing changes until you confirm.')).toBeInTheDocument();
    expect(within(dialog).getByText('AI assistant · Live')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Attach a screenshot' })).toBeInTheDocument();
    expect(posts).toHaveLength(3);
  });

  it('falls back to the demo engine when live mode hits a limit', async () => {
    stubAgentApi({ live: true, turns: [json({ reason: 'rate_limited' }, 429)] });
    renderScenario('content-recovery');
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    expect(await within(dialog).findByRole('region', { name: /^Preview: Restore/ })).toBeInTheDocument();
    expect(within(dialog).getByText('AI assistant · Demo mode')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Attach a screenshot' })).not.toBeInTheDocument();
  });

  it('stays in demo mode when the server has no key', async () => {
    const posts = stubAgentApi({ live: false, turns: [] });
    renderScenario('content-recovery');
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    expect(await within(dialog).findByRole('region', { name: /^Preview: Restore/ })).toBeInTheDocument();
    expect(within(dialog).getByText('AI assistant · Demo mode')).toBeInTheDocument();
    expect(posts).toHaveLength(0);
  });
});
