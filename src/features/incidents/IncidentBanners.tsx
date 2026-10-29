import { MdAutoAwesome } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { useOptionalHelpAgent } from '@/features/agent/agentContext';
import { useAiLayer } from '@/features/flags/aiLayer';
import { IncidentNotice } from './IncidentNotice';
import { useActiveIncidents } from './useIncidents';

interface IncidentBannersProps {
  /** Games to show incidents for; defaults to the player's games. */
  gameIds?: readonly string[];
  className?: string;
}

/** Proactive status: the outage before the question (AI layer only). */
export const IncidentBanners = ({ gameIds, className = '' }: IncidentBannersProps) => {
  const aiEnabled = useAiLayer();
  const incidents = useActiveIncidents(gameIds);
  const agent = useOptionalHelpAgent();
  if (!aiEnabled || incidents.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {incidents.map((incident) => (
        <IncidentNotice
          key={incident.id}
          incident={incident}
          headingLevel="h2"
          action={
            agent && (
              <span className="shrink-0 whitespace-nowrap">
                <Button
                  buttonStyle="btn-alert-info"
                  buttonSize="btn-md"
                  buttonWidth="w-auto"
                  onClick={() => agent.open({ scenarioId: 'known-issue' })}
                >
                  <MdAutoAwesome className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
                  Ask the Help Agent<span className="sr-only"> about this issue</span>
                </Button>
              </span>
            )
          }
        />
      ))}
    </div>
  );
};
