import {
  DEMO_EMAIL_CODE,
  DEMO_RECOVERY_SESSIONS,
  purchaseChallenge,
  verifiedFactorsFor,
  verifyIdentityFactor,
} from './security';

const sessionId = DEMO_RECOVERY_SESSIONS.usualDevice;

describe('identity checks', () => {
  it('records only passed factors, once each', async () => {
    expect(await verifyIdentityFactor(sessionId, 'email_code', '000000')).toBe(false);
    expect(verifiedFactorsFor(sessionId)).toEqual([]);
    expect(await verifyIdentityFactor(sessionId, 'email_code', ` ${DEMO_EMAIL_CODE} `)).toBe(true);
    expect(await verifyIdentityFactor(sessionId, 'email_code', DEMO_EMAIL_CODE)).toBe(true);
    expect(verifiedFactorsFor(sessionId)).toEqual(['email_code']);
  });

  it('asks about one real recent purchase between decoys', async () => {
    const { options } = purchaseChallenge();
    expect(options).toHaveLength(3);
    const results = await Promise.all(
      options.map((option) => verifyIdentityFactor(sessionId, 'purchase_history', option.value)),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('rejects unknown sessions', async () => {
    expect(await verifyIdentityFactor('nope', 'email_code', DEMO_EMAIL_CODE)).toBe(false);
  });
});
