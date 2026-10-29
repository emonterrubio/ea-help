import { demoPlayer, demoPurchases, demoRecoverySessions, demoSignIns } from './fixtures';
import { simulateLatency } from './latency';
import { createReferenceId, recordReceipt } from './receipts';
import { getDemoState, updateDemoState, type DemoState } from './store';
import type { ActionReceipt, IdentityFactor, RecoverySession, SignInRecord } from './types';

/** The prototype shows this code on screen instead of emailing it. */
export const DEMO_EMAIL_CODE = '482913';

/** Which scripted sign-in attempt each recovery scenario recovers. */
export const DEMO_RECOVERY_SESSIONS = {
  usualDevice: 'recovery-usual-device',
  newDevice: 'recovery-new-device',
} as const;

export const findRecoverySession = (sessionId: string): RecoverySession | undefined =>
  demoRecoverySessions.find((session) => session.id === sessionId);

export const getRecoverySession = async (sessionId: string): Promise<RecoverySession> => {
  await simulateLatency();
  const session = findRecoverySession(sessionId);
  if (!session) throw new Error(`Unknown recovery session ${sessionId}`);
  return session;
};

export const listRecentSignIns = async (): Promise<SignInRecord[]> => {
  await simulateLatency();
  return demoSignIns;
};

const mostRecentPurchase = [...demoPurchases].sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))[0];

export interface PurchaseChallenge {
  question: string;
  options: { value: string; label: string }[];
}

/** A purchase-history question: one real recent purchase between two decoys. */
export const purchaseChallenge = (): PurchaseChallenge => ({
  question: 'Which of these did you buy in the last few days?',
  options: [
    { value: 'decoy-sims', label: 'The Sims 4: Cottage Living Expansion Pack' },
    { value: mostRecentPurchase?.id ?? 'none', label: mostRecentPurchase?.itemName ?? 'None of these' },
    { value: 'decoy-nhl', label: 'NHL 23: 5,850 NHL Points' },
  ],
});

const FACTOR_CHECKS: Record<IdentityFactor, (answer: string) => boolean> = {
  email_code: (answer) => answer.trim() === DEMO_EMAIL_CODE,
  purchase_history: (answer) => answer === mostRecentPurchase?.id,
};

/** Checks one identity factor and records a pass. Answers are checked here, never by the agent. */
export const verifyIdentityFactor = async (
  sessionId: string,
  factor: IdentityFactor,
  answer: string,
): Promise<boolean> => {
  await simulateLatency();
  if (!findRecoverySession(sessionId) || !FACTOR_CHECKS[factor](answer)) return false;
  updateDemoState((state) => {
    const passed = state.verifiedFactors[sessionId] ?? [];
    return passed.includes(factor)
      ? state
      : { ...state, verifiedFactors: { ...state.verifiedFactors, [sessionId]: [...passed, factor] } };
  });
  return true;
};

export const verifiedFactorsFor = (sessionId: string, state: DemoState = getDemoState()): IdentityFactor[] =>
  state.verifiedFactors[sessionId] ?? [];

export const FACTOR_LABELS: Record<IdentityFactor, string> = {
  email_code: 'Code sent to your email',
  purchase_history: 'Recent purchase',
};

/**
 * Emails a password reset link and signs out every other device. Callers must run
 * the recovery risk check first (the agent's `executeAction` does).
 */
export const resetCredentials = async (sessionId: string, now = new Date()): Promise<ActionReceipt> => {
  await simulateLatency();
  const session = findRecoverySession(sessionId);
  if (!session) throw new Error(`Unknown recovery session ${sessionId}`);
  const factors = verifiedFactorsFor(sessionId).map((factor) => FACTOR_LABELS[factor]);
  const receipt = recordReceipt(
    {
      referenceId: createReferenceId(now),
      kind: 'reset_credentials',
      subject: sessionId,
      title: 'Password reset and other devices signed out',
      appliedAt: now.toISOString(),
      undoable: false,
    },
    {
      gameId: null,
      summary: `You couldn't sign in on your ${session.device}. After ${factors.length} identity checks, the Help Agent emailed a password reset link to ${demoPlayer.maskedEmail} and signed out every other device.`,
      details: [
        `Sign-in attempt: ${session.device}, ${session.location}`,
        `Identity checks passed: ${factors.join(', ')}`,
        'Risk check: low (usual device and region, no recent email change)',
      ],
      outcome: 'Password reset link sent and other devices signed out.',
    },
    now,
  );
  // Identity checks are single-use: another change needs fresh verification.
  updateDemoState((state) => ({
    ...state,
    verifiedFactors: Object.fromEntries(Object.entries(state.verifiedFactors).filter(([id]) => id !== sessionId)),
  }));
  return receipt;
};
