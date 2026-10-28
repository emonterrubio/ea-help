import type { AutonomyLevel } from '../policy/autonomy';

export type ScenarioId =
  | 'quick-answer'
  | 'content-recovery'
  | 'content-review'
  | 'diagnostics'
  | 'known-issue'
  | 'account-recovery'
  | 'account-recovery-risky'
  | 'escalate';

/** PRD capability numbers (Solution: the AI layer). */
export type Capability =
  | 'Help Agent'
  | 'Instant Content Recovery'
  | 'Guided Diagnostics'
  | 'Secure Account Recovery'
  | 'Answer-first Search & Proactive Status'
  | 'Living Cases & Warm Handoff';

export interface Scenario {
  id: ScenarioId;
  title: string;
  /** What the player types to start it. */
  prompt: string;
  /** One-line outcome, shown in the scenario hub. */
  outcome: string;
  capability: Capability;
  /** Highest autonomy level the scenario reaches. */
  level: AutonomyLevel;
  /** Build phase that delivers the full flow (docs/AI_LAYER_PLAN.md). */
  phase: 1 | 2 | 3;
}

/** Latest build phase that has shipped (docs/AI_LAYER_PLAN.md). */
export const CURRENT_PHASE = 2;

export const isScenarioAvailable = (scenario: Scenario): boolean => scenario.phase <= CURRENT_PHASE;

export const SCENARIOS: Scenario[] = [
  {
    id: 'quick-answer',
    title: 'Quick answer',
    prompt: 'How do I turn on login verification?',
    outcome: 'A short answer that cites the help article. No case needed.',
    capability: 'Help Agent',
    level: 'L0',
    phase: 1,
  },
  {
    id: 'known-issue',
    title: 'Known issue',
    prompt: "FIFA 23 matchmaking won't connect",
    outcome: 'The active incident, its status and ETA, and an option to follow it.',
    capability: 'Answer-first Search & Proactive Status',
    level: 'L0',
    phase: 1,
  },
  {
    id: 'diagnostics',
    title: 'Crash troubleshooting',
    prompt: 'Battlefield 2042 keeps crashing on my PS5 in multiplayer',
    outcome: 'Targeted steps for PS5. When nothing works, a case with the full diagnostic log.',
    capability: 'Guided Diagnostics',
    level: 'L1',
    phase: 2,
  },
  {
    id: 'escalate',
    title: 'Talk to a person',
    prompt: "This is the third time I've asked. I want to talk to a real person.",
    outcome: 'An immediate warm handoff. The advisor already has the story.',
    capability: 'Living Cases & Warm Handoff',
    level: 'L3',
    phase: 2,
  },
  {
    id: 'content-recovery',
    title: 'Missing purchase',
    prompt: "I bought Madden Points in Madden NFL 23 but they're not showing up",
    outcome: 'Purchase verified, restore preview, one tap, receipt in My Cases.',
    capability: 'Instant Content Recovery',
    level: 'L2',
    phase: 3,
  },
  {
    id: 'content-review',
    title: 'Missing purchase (needs review)',
    prompt: 'My Battlefield 2042 Year 2 Ultimate Pass bundle never arrived',
    outcome: 'Over the auto-restore limit, so the agent drafts a case with evidence. No screenshots asked.',
    capability: 'Instant Content Recovery',
    level: 'L3',
    phase: 3,
  },
  {
    id: 'account-recovery',
    title: 'Locked out',
    prompt: "I can't sign in to my EA account",
    outcome: 'Identity checks, credential reset and a security checklist.',
    capability: 'Secure Account Recovery',
    level: 'L2',
    phase: 3,
  },
  {
    id: 'account-recovery-risky',
    title: 'Locked out (high risk)',
    prompt: 'I think someone hacked my account and changed my email',
    outcome: 'Risk signals cap autonomy. Context goes to a person, no changes applied.',
    capability: 'Secure Account Recovery',
    level: 'L3',
    phase: 3,
  },
];

export const findScenario = (id: string): Scenario | undefined => SCENARIOS.find((scenario) => scenario.id === id);

export const isScenarioId = (value: string): value is ScenarioId => findScenario(value) !== undefined;
