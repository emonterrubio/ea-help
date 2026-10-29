import type { AgentCard } from '@/agent/protocol';
import { IncidentNotice } from '@/features/incidents/IncidentNotice';
import { useIncident } from '@/features/incidents/useIncidents';
import { ActionPreviewCard } from './ActionPreviewCard';
import { CaseDraftCard } from './CaseDraftCard';
import { DiagnosticCard } from './DiagnosticCard';
import { IdentityCheckCard } from './IdentityCheckCard';
import { ReceiptCard } from './ReceiptCard';
import { SecurityChecklistCard } from './SecurityChecklistCard';

const IncidentCard = ({ incidentId }: { incidentId: string }) => {
  const incident = useIncident(incidentId);
  return incident ? <IncidentNotice incident={incident} /> : null;
};

/** Renders a structured card from the agent. */
export const AgentCardView = ({ card }: { card: AgentCard }) => {
  switch (card.type) {
    case 'incident':
      return <IncidentCard incidentId={card.incidentId} />;
    case 'diagnostic':
      return <DiagnosticCard treeId={card.treeId} />;
    case 'case_draft':
      return <CaseDraftCard draft={card.draft} />;
    case 'action_preview':
      return (
        <ActionPreviewCard
          action={card.action}
          title={card.title}
          details={card.details}
          changes={card.changes}
          confirmLabel={card.confirmLabel}
        />
      );
    case 'receipt':
      return (
        <ReceiptCard
          referenceId={card.referenceId}
          title={card.title}
          appliedAt={card.appliedAt}
          undoable={card.undoable}
          caseId={card.caseId}
        />
      );
    case 'identity_check':
      return <IdentityCheckCard sessionId={card.sessionId} />;
    case 'security_checklist':
      return <SecurityChecklistCard items={card.items} />;
  }
};
