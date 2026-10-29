import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { setAiLayerEnabled } from '@/features/flags/aiLayer';
import { routes } from '@/routes';
import { DEMO_EMAIL_CODE } from '@/services/ea-api/security';

const renderAt = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
};

describe('content recovery (L2)', () => {
  it('previews, restores on confirm, and undoes from My Cases', async () => {
    const router = renderAt('/?scenario=content-recovery');
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    const preview = await within(dialog).findByRole('region', { name: /^Preview: Restore/ });
    expect(preview).toHaveTextContent('EA-8F3K-2210');

    await userEvent.click(within(preview).getByRole('button', { name: 'Restore now' }));
    const receipt = await within(dialog).findByRole('region', { name: 'Receipt' });
    expect(receipt).toHaveTextContent(/Reference ID\s*EAR-/);

    await userEvent.click(within(receipt).getByRole('link', { name: 'View in My Cases' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/cases\/active\/ai-ear-/));
    const undo = await screen.findByRole('button', { name: 'Undo this change' });
    expect(screen.getByRole('region', { name: 'Where your case stands' })).toHaveTextContent(/Done\. Restored/);

    await userEvent.click(undo);
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Where your case stands' })).toHaveTextContent(/^.*Undone\./),
    );
    expect(screen.queryByRole('button', { name: 'Undo this change' })).not.toBeInTheDocument();
    expect(screen.getByText('Change undone')).toBeInTheDocument();
  });

  it('changes nothing when the player taps "Not now"', async () => {
    renderAt('/?scenario=content-recovery');
    const preview = await screen.findByRole('region', { name: /^Preview: Restore/ });
    await userEvent.click(within(preview).getByRole('button', { name: 'Not now' }));
    expect(within(preview).getByRole('status')).toHaveTextContent('Nothing was changed.');
    expect(screen.queryByRole('region', { name: 'Receipt' })).not.toBeInTheDocument();
  });
});

describe('secure account recovery', () => {
  it('verifies identity, resets on confirm, and shows the security checklist', async () => {
    renderAt('/account');
    await userEvent.click(await screen.findByRole('button', { name: 'Get help signing in' }));
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    const checks = await within(dialog).findByRole('region', { name: "Confirm it's you" });

    await userEvent.type(within(checks).getByLabelText(/6-digit code/), '111111');
    await userEvent.click(within(checks).getByRole('button', { name: 'Verify code' }));
    expect(await within(checks).findByRole('alert')).toHaveTextContent("doesn't match");
    await userEvent.clear(within(checks).getByLabelText(/6-digit code/));
    await userEvent.type(within(checks).getByLabelText(/6-digit code/), DEMO_EMAIL_CODE);
    await userEvent.click(within(checks).getByRole('button', { name: 'Verify code' }));
    expect(await within(checks).findByText('Email code verified')).toBeInTheDocument();

    await userEvent.click(within(checks).getByLabelText(/Madden Points/));
    await userEvent.click(within(checks).getByRole('button', { name: 'Confirm purchase' }));

    const preview = await within(dialog).findByRole('region', { name: 'Preview: Reset your password' });
    await userEvent.click(within(preview).getByRole('button', { name: 'Reset password' }));
    const checklist = await within(dialog).findByRole('region', { name: 'Security checklist' });
    expect(checklist).toHaveTextContent('Signed out of every other device (done)');
    expect(checklist).toHaveTextContent('Turn on login verification (2FA) (to do)');
  });

  it('hands a high-risk session to a person without any reset offer', async () => {
    renderAt('/?scenario=account-recovery-risky');
    const dialog = await screen.findByRole('dialog', { name: /ea help agent/i });
    expect(await within(dialog).findByRole('region', { name: 'Handoff to an advisor' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('region', { name: /^Preview:/ })).not.toBeInTheDocument();
  });

  it('keeps My Account as v1 when the AI layer is off', async () => {
    setAiLayerEnabled(false);
    renderAt('/account');
    expect(await screen.findByText(/self-help tools/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Get help signing in' })).not.toBeInTheDocument();
  });
});
