import type { ProposedAction } from './actions/types';
import type { AutonomyLevel } from './policy/autonomy';
import type { CaseDraftInput } from '@/services/ea-api/types';
import type { ScenarioId } from './demo/scenarios';
import type { DiagnosticResult } from './diagnostics/types';

/*
 * One event contract for both engines (scripted demo and live Claude). The UI only
 * renders these events, so both modes look and behave the same.
 */

export type Citation =
  | { kind: 'article'; articleId: string; title: string }
  | { kind: 'purchase'; purchaseId: string; label: string }
  | { kind: 'policy'; policyId: string; label: string }
  | { kind: 'incident'; incidentId: string; label: string };

export interface PreviewDetail {
  label: string;
  value: string;
}

export type AgentCard =
  /** Exactly what an L2 action will change. Nothing happens until the player confirms. */
  | {
      type: 'action_preview';
      actionId: string;
      action: ProposedAction;
      title: string;
      details: PreviewDetail[];
      changes: string[];
      confirmLabel: string;
    }
  /** Proof of an applied change, with a reference ID and undo where it can be reversed. */
  | { type: 'receipt'; referenceId: string; title: string; appliedAt: string; undoable: boolean; caseId?: string }
  /** Identity checks before account recovery (the answers are checked by EA, never by the model). */
  | { type: 'identity_check'; sessionId: string }
  /** Interactive guided diagnostics: targeted questions, then step cards (L1). */
  | { type: 'diagnostic'; treeId: string }
  /** Auto-drafted case the player reviews and sends (L3). */
  | { type: 'case_draft'; draftId: string; draft: CaseDraftInput }
  | { type: 'security_checklist'; items: { label: string; done: boolean }[] }
  | { type: 'incident'; incidentId: string };

export type AgentEvent =
  /** Narrated progress while tools run ("Checking your purchases…"). */
  | { type: 'status'; id: string; text: string }
  | { type: 'message'; id: string; text: string; citations?: Citation[]; level?: AutonomyLevel }
  | { type: 'card'; id: string; card: AgentCard; level: AutonomyLevel }
  | {
      type: 'handoff';
      id: string;
      advisorName: string;
      summary: string;
      /** The case the advisor picks up (always created before a handoff). */
      caseId: string;
      caseNumber: string;
      /** The advisor's first message, written from the agent's summary. */
      greeting: string;
    }
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

/** A screenshot the player attached, downscaled in the browser (vision intake, live mode only). */
export interface ImageAttachment {
  name: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  /** Base64 without the data-URL prefix. */
  data: string;
}

export type AgentInput =
  | { kind: 'text'; text: string; image?: ImageAttachment }
  | { kind: 'scenario'; scenarioId: ScenarioId }
  | { kind: 'talk_to_person' }
  | { kind: 'diagnostic_result'; result: DiagnosticResult }
  | { kind: 'submit_case'; draft: CaseDraftInput }
  /** The player tapped confirm on an action preview. Runs in the browser, never from the model. */
  | { kind: 'confirm_action'; action: ProposedAction }
  | { kind: 'identity_verified'; sessionId: string };

export interface AgentRequest {
  conversationId: string;
  input: AgentInput;
  context: AgentContext;
  /** Prior player messages, newest last, for the handoff summary. */
  history: string[];
  /** Guided diagnostics completed in this conversation (attached to any case). */
  diagnostics: DiagnosticResult[];
}

export type AgentMode = 'demo' | 'live';

export interface AgentEngine {
  readonly mode: AgentMode;
  run: (request: AgentRequest, signal: AbortSignal) => AsyncIterable<AgentEvent>;
}
