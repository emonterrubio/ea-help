/** Signals that cap the agent's autonomy during account recovery. */
export interface RecoverySignals {
  newDevice: boolean;
  regionChanged: boolean;
  /** Email changed within the last 14 days. */
  recentEmailChange: boolean;
  /** Identity checks the player passed (email, phone, purchase history, play history). */
  verifiedFactors: number;
}

export type RecoveryRisk = { level: 'low' } | { level: 'high'; reasons: string[] };

export const MIN_VERIFIED_FACTORS = 2;

/**
 * High risk means L3: the agent gathers context and routes to a person before any
 * account change is applied (PRD acceptance: 0 changes on high-risk sessions).
 */
export const assessRecoveryRisk = (signals: RecoverySignals): RecoveryRisk => {
  const reasons: string[] = [];
  if (signals.newDevice) reasons.push('Sign-in attempt from a new device');
  if (signals.regionChanged) reasons.push('Sign-in attempt from a new region');
  if (signals.recentEmailChange) reasons.push('Account email changed recently');
  if (signals.verifiedFactors < MIN_VERIFIED_FACTORS) reasons.push('Not enough identity checks passed');
  // A single soft signal with strong verification stays low risk.
  const softOnly = reasons.length === 1 && signals.newDevice && signals.verifiedFactors >= MIN_VERIFIED_FACTORS + 1;
  return reasons.length === 0 || softOnly ? { level: 'low' } : { level: 'high', reasons };
};
