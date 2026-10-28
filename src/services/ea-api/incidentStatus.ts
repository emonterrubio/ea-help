import type { IncidentStatus } from './types';

/** Plain-language incident status for players. */
export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  investigating: 'Investigating',
  identified: 'Cause identified, fix in progress',
  monitoring: 'Fix released, monitoring',
  resolved: 'Resolved',
};

/** What players should expect next; `null` once there is nothing left to wait for. */
export const incidentExpectation = (status: IncidentStatus, eta: string): string | null => {
  switch (status) {
    case 'investigating':
    case 'identified':
      return eta;
    case 'monitoring':
      return 'A fix is out. EA is confirming it worked';
    case 'resolved':
      return null;
  }
};
