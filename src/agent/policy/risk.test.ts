import { assessRecoveryRisk } from './risk';

const base = { newDevice: false, regionChanged: false, recentEmailChange: false, verifiedFactors: 2 };

describe('assessRecoveryRisk', () => {
  it('is low risk with no signals and enough verification', () => {
    expect(assessRecoveryRisk(base)).toEqual({ level: 'low' });
  });

  it('tolerates a new device alone when verification is strong', () => {
    expect(assessRecoveryRisk({ ...base, newDevice: true, verifiedFactors: 3 })).toEqual({ level: 'low' });
  });

  it('is high risk for a new device with only minimal verification', () => {
    expect(assessRecoveryRisk({ ...base, newDevice: true }).level).toBe('high');
  });

  it('is high risk for region or email changes and lists every reason', () => {
    const risk = assessRecoveryRisk({ ...base, newDevice: true, regionChanged: true, recentEmailChange: true });
    expect(risk).toEqual({
      level: 'high',
      reasons: [
        'Sign-in attempt from a new device',
        'Sign-in attempt from a new region',
        'Account email changed recently',
      ],
    });
  });

  it('is high risk when too few identity checks passed', () => {
    expect(assessRecoveryRisk({ ...base, verifiedFactors: 1 }).level).toBe('high');
  });
});
