import type { ReactNode } from 'react';
import { MdCheckCircleOutline, MdOutlineWarningAmber } from 'react-icons/md';
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

/** Known-issue status with ETA and a follow toggle. Used as a page banner and an agent card. */
export const IncidentNotice = ({ incident, headingLevel: Heading = 'h3', action }: IncidentNoticeProps) => {
  const isResolved = incident.status === 'resolved';
  const expectation = incidentExpectation(incident.status, incident.eta);
  const Icon = isResolved ? MdCheckCircleOutline : MdOutlineWarningAmber;

  return (
    <section
      aria-label={`Known issue: ${incident.title}`}
      className={`rounded-md border-0 border-l-4 border-solid p-4 ${
        isResolved ? 'border-green-600 bg-green-50' : 'border-amber-500 bg-amber-50'
      }`}
    >
      <div className="flex gap-x-3">
        <Icon
          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isResolved ? 'text-green-700' : 'text-amber-700'}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="eyebrow-default text-gray-600">Known issue</p>
          <Heading className="electronicArtsTextBold text-base text-gray-900">{incident.title}</Heading>
          <p className="mt-1 body-small text-gray-700">{incident.summary}</p>
          {/* dt/dd carry the type classes: the legacy reset styles those elements directly. */}
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
            <div>
              <dt className="inline electronicArtsTextBold text-sm leading-5 tracking-wide">Status: </dt>
              <dd className="inline body-small">{INCIDENT_STATUS_LABELS[incident.status]}</dd>
            </div>
            {expectation && (
              <div>
                <dt className="inline electronicArtsTextBold text-sm leading-5 tracking-wide">Next: </dt>
                <dd className="inline body-small">{expectation}</dd>
              </div>
            )}
          </dl>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!isResolved && <FollowIncidentButton incidentId={incident.id} />}
            {action}
          </div>
        </div>
      </div>
    </section>
  );
};
