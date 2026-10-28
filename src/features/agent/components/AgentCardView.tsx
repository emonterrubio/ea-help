import type { AgentCard } from '@/agent/protocol';
import { IncidentNotice } from '@/features/incidents/IncidentNotice';
import { useIncident } from '@/features/incidents/useIncidents';

const IncidentCard = ({ incidentId }: { incidentId: string }) => {
  const incident = useIncident(incidentId);
  return incident ? <IncidentNotice incident={incident} /> : null;
};

/** Renders a structured card from the agent. Further card types arrive with their build phase. */
export const AgentCardView = ({ card }: { card: AgentCard }) => {
  switch (card.type) {
    case 'incident':
      return <IncidentCard incidentId={card.incidentId} />;
    default:
      return null;
  }
};
