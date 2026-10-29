import type { FixKind } from '../policy/fixes';

/**
 * Diagnostic decision trees are authored by support content teams. The agent picks
 * the tree and the path from the player's answers; it never invents fixes.
 */
export interface DiagnosticQuestion {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

/** A step the agent can apply for the player after they confirm (L2). */
export interface OneClickFix {
  kind: FixKind;
  /** Button text, e.g. "Refresh my licenses". */
  label: string;
  /** Exactly what the fix changes, shown before the player confirms. */
  changes: string[];
}

export interface DiagnosticStep {
  id: string;
  title: string;
  /** Instructions written for the player's platform. */
  body: string;
  fix?: OneClickFix;
}

export interface DiagnosticTree {
  id: string;
  title: string;
  gameId: string;
  platform: string;
  questions: DiagnosticQuestion[];
  steps: Record<string, DiagnosticStep>;
  /** Ordered step ids to try, chosen from the answers. */
  selectPath: (answers: Readonly<Record<string, string>>) => string[];
}

export type StepOutcome = 'done' | 'skipped' | 'failed';

export interface DiagnosticLogEntry {
  stepId: string;
  title: string;
  outcome: StepOutcome;
  /** Receipt reference when the step's one-click fix was applied. */
  reference?: string;
}

/** What the player did in a diagnostic flow, attached to any case it creates. */
export interface DiagnosticResult {
  treeId: string;
  treeTitle: string;
  answers: { question: string; answer: string }[];
  log: DiagnosticLogEntry[];
  outcome: 'resolved' | 'unresolved';
}
