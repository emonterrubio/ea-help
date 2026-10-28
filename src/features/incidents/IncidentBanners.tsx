import { MdAutoAwesome } from 'react-icons/md';
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
              <button
                type="button"
                onClick={() => agent.open({ scenarioId: 'known-issue' })}
                className="inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 electronicArtsTextBold text-xs tracking-wide text-blue-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <MdAutoAwesome className="h-4 w-4" aria-hidden="true" />
                Ask the Help Agent<span className="sr-only"> about this issue</span>
              </button>
            )
          }
        />
      ))}
    </div>
  );
};
