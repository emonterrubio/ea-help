import { requiresHuman, requiresPlayerConfirmation, TOOL_LEVELS, type ToolName } from './autonomy';

describe('tool autonomy levels', () => {
  it('requires a confirm tap for every account-changing tool', () => {
    const accountChanging: ToolName[] = ['restore_entitlement', 'refresh_entitlements', 'reset_cloud_save'];
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
    expect(requiresHuman('handoff_to_advisor')).toBe(true);
  });
});
