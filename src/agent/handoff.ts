import { createAgentCase } from '@/services/ea-api/cases';
import type { CaseDraftInput } from '@/services/ea-api/types';
import { advisorGreeting } from './casework';
import { nextEventId, pause, statusEvent } from './pacing';
import type { AgentContext, AgentEvent } from './protocol';

/** Creates the case and hands it to a person, who starts from the agent's summary (L3). Shared by both engines. */
export async function* handOff(draft: CaseDraftInput, context: AgentContext, signal: AbortSignal) {
  yield statusEvent('Creating your case…');
  await pause(signal);
  const created = await createAgentCase(draft);
  yield statusEvent('Connecting you with an advisor…');
  await pause(signal);
  yield {
    type: 'handoff',
    id: nextEventId(),
    advisorName: draft.advisorName,
    summary: draft.summary,
    caseId: created.id,
    caseNumber: created.case,
    greeting: advisorGreeting(draft, context),
  } satisfies AgentEvent;
}
