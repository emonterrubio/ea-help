import type { ReactNode } from 'react';
import { MdCheckCircleOutline, MdOutlineWarningAmber } from 'react-icons/md';
import { Alert } from '@/components/alert/Alert';
import { INCIDENT_STATUS_LABELS, incidentExpectation } from '@/services/ea-api/incidentStatus';
import type { Incident } from '@/services/ea-api/types';
import { FollowIncidentButton } from './FollowIncidentButton';

interface IncidentNoticeProps {
  incident: Incident;
  /** Heading level inside the surrounding page or panel. */
  headingLevel?: 'h2' | 'h3';
  /** Extra action (e.g. "Ask the Help Agent" on page banners). */
  action?: ReactNode;
}

/** Known-issue alert. Same shell as the info alert, with warning or success severity. */
export const IncidentNotice = ({ incident, headingLevel = 'h3', action }: IncidentNoticeProps) => {
  const isResolved = incident.status === 'resolved';
  const expectation = incidentExpectation(incident.status, incident.eta);
  const Icon = isResolved ? MdCheckCircleOutline : MdOutlineWarningAmber;
  const showFollow = !isResolved;

  return (
    <Alert
      severity={isResolved ? 'success' : 'warning'}
      icon={<Icon className="h-6 w-6" aria-hidden="true" />}
      title="Known issue"
      headingLevel={headingLevel}
      label={`Known issue: ${incident.title}`}
      actions={
        showFollow || action != null ? (
          <>
            {showFollow && <FollowIncidentButton incidentId={incident.id} />}
            {action}
          </>
        ) : undefined
      }
    >
      <p className="mt-1 electronicArtsTextBold text-base">{incident.title}</p>
      <p className="mt-1 text-sm tracking-wide">{incident.summary}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <p className="text-sm tracking-wide">
          <span className="electronicArtsTextBold">Status: </span>
          {INCIDENT_STATUS_LABELS[incident.status]}
        </p>
        {expectation && (
          <p className="text-sm tracking-wide">
            <span className="electronicArtsTextBold">Next: </span>
            {expectation}
          </p>
        )}
      </div>
    </Alert>
  );
};
