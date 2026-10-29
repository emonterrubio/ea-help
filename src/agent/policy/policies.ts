/** Published support policies the agent may cite. Citations must use one of these ids. */
export const POLICIES = {
  'instant-restore': 'Instant restore policy',
  'account-recovery': 'Account recovery policy',
} as const;

export type PolicyId = keyof typeof POLICIES;

export const policyCitation = (policyId: PolicyId) => ({
  kind: 'policy' as const,
  policyId,
  label: POLICIES[policyId],
});
