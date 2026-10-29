import {
  isToolName,
  maxLevel,
  requiresHuman,
  requiresPlayerConfirmation,
  TOOL_LEVELS,
  type ToolName,
} from './autonomy';

describe('tool autonomy levels', () => {
  it('requires a confirm tap for every account-changing tool', () => {
    const accountChanging: ToolName[] = ['propose_restore', 'propose_license_refresh', 'start_account_recovery'];
    accountChanging.forEach((tool) => expect(requiresPlayerConfirmation(tool)).toBe(true));
  });

  it('never lets read-only tools change anything', () => {
    (Object.keys(TOOL_LEVELS) as ToolName[])
      .filter((tool) => TOOL_LEVELS[tool] === 'L0')
      .forEach((tool) => {
        expect(requiresPlayerConfirmation(tool)).toBe(false);
        expect(requiresHuman(tool)).toBe(false);
      });
  });

  it('routes case drafting and handoff to a human', () => {
    expect(requiresHuman('draft_case')).toBe(true);
    expect(requiresHuman('hand_off_to_advisor')).toBe(true);
  });

  it('recognizes only declared tool names', () => {
    expect(isToolName('list_purchases')).toBe(true);
    expect(isToolName('grant_entitlement')).toBe(false);
    expect(isToolName('toString')).toBe(false);
  });

  it('labels a reply with the highest level it reached', () => {
    expect(maxLevel('L0', 'L2')).toBe('L2');
    expect(maxLevel('L3', 'L1')).toBe('L3');
  });
});
