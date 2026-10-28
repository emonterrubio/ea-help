/**
 * Autonomy is set by risk, not capability (PRD: Trust, safety, and guardrails).
 * Every tool the agent can call is assigned exactly one level.
 */
export type AutonomyLevel = 'L0' | 'L1' | 'L2' | 'L3';

export interface AutonomyLevelInfo {
  level: AutonomyLevel;
  name: string;
  agentMay: string;
  playerSees: string;
}

export const AUTONOMY_LEVELS: Record<AutonomyLevel, AutonomyLevelInfo> = {
  L0: { level: 'L0', name: 'Inform', agentMay: 'Read and explain', playerSees: 'Cited answer' },
  L1: { level: 'L1', name: 'Suggest', agentMay: 'Recommend a next step', playerSees: 'Step card' },
  L2: {
    level: 'L2',
    name: 'Act with confirm',
    agentMay: 'Change the account after an explicit tap',
    playerSees: 'Preview card + receipt',
  },
  L3: {
    level: 'L3',
    name: 'Human required',
    agentMay: 'Gather context and draft the case',
    playerSees: 'Auto-drafted case + handoff',
  },
};

/** Tool names the agent can use, mapped to their autonomy level. */
export const TOOL_LEVELS = {
  search_help_articles: 'L0',
  get_player_context: 'L0',
  list_purchases: 'L0',
  check_entitlement: 'L0',
  get_known_issues: 'L0',
  get_case_status: 'L0',
  suggest_diagnostic_steps: 'L1',
  restore_entitlement: 'L2',
  refresh_entitlements: 'L2',
  reset_cloud_save: 'L2',
  draft_case: 'L3',
  handoff_to_advisor: 'L3',
} as const satisfies Record<string, AutonomyLevel>;

export type ToolName = keyof typeof TOOL_LEVELS;

export const levelForTool = (tool: ToolName): AutonomyLevel => TOOL_LEVELS[tool];

/** L2 tools never run from the model: they produce a proposal the player confirms. */
export const requiresPlayerConfirmation = (tool: ToolName): boolean => levelForTool(tool) === 'L2';

/** L3 tools never change the account: they hand the issue to a person. */
export const requiresHuman = (tool: ToolName): boolean => levelForTool(tool) === 'L3';
