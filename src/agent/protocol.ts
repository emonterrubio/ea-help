import type { AutonomyLevel } from './policy/autonomy';
import type { ScenarioId } from './demo/scenarios';

/*
 * One event contract for both engines (scripted demo and live Claude). The UI only
 * renders these events, so both modes look and behave the same.
 */

export type Citation =
  | { kind: 'article'; articleId: string; title: string }
  | { kind: 'purchase'; purchaseId: string; label: string }
  | { kind: 'policy'; policyId: string; label: string }
  | { kind: 'incident'; incidentId: string; label: string };

export type DiagnosticStepStatus = 'pending' | 'done' | 'skipped' | 'failed';

export type AgentCard =
  | {
      type: 'restore_preview';
      actionId: string;
      purchaseId: string;
      itemName: string;
      gameTitle: string;
      orderNumber: string;
      purchasedAt: string;
      amountUsd: number;
      changes: string[];
    }
  | { type: 'receipt'; referenceId: string; itemName: string; grantedAt: string; undoAvailable: boolean }
  | {
      type: 'diagnostic_step';
      treeId: string;
      stepId: string;
      title: string;
      body: string;
      status: DiagnosticStepStatus;
    }
  | {
      type: 'case_draft';
      draftId: string;
      title: string;
      summary: string;
      evidence: string[];
      stepsTried: string[];
      sentiment: 'calm' | 'frustrated' | 'distressed';
    }
  | { type: 'security_checklist'; items: { label: string; done: boolean }[] }
  | { type: 'incident'; incidentId: string };

export type AgentEvent =
  /** Narrated progress while tools run ("Checking your purchases…"). */
  | { type: 'status'; id: string; text: string }
  | { type: 'message'; id: string; text: string; citations?: Citation[]; level?: AutonomyLevel }
  | { type: 'card'; id: string; card: AgentCard; level: AutonomyLevel }
  | { type: 'handoff'; id: string; advisorName: string; summary: string }
  | { type: 'error'; id: string; message: string }
  | { type: 'done' };

/** Account context pre-filled before the first reply (PRD: context pre-fill). */
export interface AgentContext {
  playerName: string;
  platform: string;
  region: string;
  ownedGames: { id: string; title: string }[];
  activeIncidentIds: string[];
}

export type AgentInput =
  { kind: 'text'; text: string } | { kind: 'scenario'; scenarioId: ScenarioId } | { kind: 'talk_to_person' };

export interface AgentRequest {
  conversationId: string;
  input: AgentInput;
  context: AgentContext;
  /** Prior player messages, newest last, for the handoff summary. */
  history: string[];
}

export type AgentMode = 'demo' | 'live';

export interface AgentEngine {
  readonly mode: AgentMode;
  run: (request: AgentRequest, signal: AbortSignal) => AsyncIterable<AgentEvent>;
}
