import type { ScenarioId } from './scenarios';

interface IntentRule {
  scenario: ScenarioId;
  patterns: RegExp[];
}

/*
 * Ordered keyword rules for the scripted demo. Safety and escalation come first so
 * distress or a request for a person always wins (PRD: sentiment and safety triggers).
 */
const RULES: IntentRule[] = [
  {
    scenario: 'escalate',
    patterns: [
      /\b(real|actual)\s+person\b/i,
      /\btalk to (a |an )?(human|person|advisor|agent)\b/i,
      /\bharass/i,
      /\b(threat|unsafe|scared|hopeless)\b/i,
    ],
  },
  {
    scenario: 'account-recovery-risky',
    patterns: [/\bhack(ed)?\b/i, /\bcompromis/i, /\bchanged my (email|password)\b/i, /\bstolen account\b/i],
  },
  {
    scenario: 'account-recovery',
    patterns: [/\bcan'?t (sign|log) ?in\b/i, /\blocked out\b/i, /\bforgot (my )?password\b/i, /\b2fa\b/i],
  },
  {
    scenario: 'content-review',
    patterns: [/\bultimate pass\b/i, /\bbattlefield\b.*\b(bundle|pass)\b/i],
  },
  {
    scenario: 'content-recovery',
    patterns: [
      /\b(bought|purchased|paid for)\b/i,
      /\b(pack|points|coins|bundle)\b.*\b(missing|not showing|never arrived|didn'?t (get|arrive))\b/i,
      /\bmissing (content|item|pack|points)\b/i,
    ],
  },
  {
    scenario: 'diagnostics',
    patterns: [/\bcrash/i, /\bfreez/i, /\bwon'?t (launch|start|load)\b/i, /\bblack screen\b/i],
  },
  {
    scenario: 'known-issue',
    patterns: [/\bmatchmaking\b/i, /\bservers?\b.*\b(down|issue|problem)\b/i, /\boutage\b/i, /\bwon'?t connect\b/i],
  },
  {
    scenario: 'quick-answer',
    patterns: [/\btwitch\b/i, /\blink (my )?(ea )?account\b/i],
  },
];

/** Maps free text to a scripted scenario, or `null` when nothing matches. */
export const routeIntent = (text: string): ScenarioId | null =>
  RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(text)))?.scenario ?? null;
