import type { AgentCard } from '@/agent/protocol';
import { IncidentNotice } from '@/features/incidents/IncidentNotice';
import { useIncident } from '@/features/incidents/useIncidents';
import { CaseDraftCard } from './CaseDraftCard';
import { DiagnosticCard } from './DiagnosticCard';

const IncidentCard = ({ incidentId }: { incidentId: string }) => {
  const incident = useIncident(incidentId);
  return incident ? <IncidentNotice incident={incident} /> : null;
};

/** Renders a structured card from the agent. Further card types arrive with their build phase. */
export const AgentCardView = ({ card }: { card: AgentCard }) => {
  switch (card.type) {
    case 'incident':
      return <IncidentCard incidentId={card.incidentId} />;
    case 'diagnostic':
      return <DiagnosticCard treeId={card.treeId} />;
    case 'case_draft':
      return <CaseDraftCard draft={card.draft} />;
    default:
      return null;
  }
};
