import { useEffect, useRef, useState } from 'react';
import { MdClose, MdNotificationsActive } from 'react-icons/md';
import { incidentsWithStatus } from '@/services/ea-api/api';
import { INCIDENT_STATUS_LABELS } from '@/services/ea-api/incidentStatus';
import { useDemoState } from '@/services/ea-api/store';
import type { IncidentStatus } from '@/services/ea-api/types';

interface Toast {
  id: string;
  title: string;
  status: IncidentStatus;
}

const AUTO_DISMISS_MS = 8000;

/** Notifies followers when a followed incident changes status. */
export const IncidentNotifications = () => {
  const { incidentStatus, followedIncidentIds } = useDemoState();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const previous = useRef<Record<string, IncidentStatus> | null>(null);

  useEffect(() => {
    const current = Object.fromEntries(incidentsWithStatus(incidentStatus).map((incident) => [incident.id, incident]));
    const before = previous.current;
    previous.current = Object.fromEntries(Object.values(current).map((incident) => [incident.id, incident.status]));
    if (!before) return;
    const changed = followedIncidentIds.flatMap((id) => {
      const incident = current[id];
      return incident && before[id] !== incident.status
        ? [{ id: `${id}-${incident.status}`, title: incident.title, status: incident.status }]
        : [];
    });
    if (changed.length > 0) setToasts((existing) => [...existing, ...changed]);
  }, [incidentStatus, followedIncidentIds]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts((existing) => existing.slice(1)), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismiss = (id: string) => setToasts((existing) => existing.filter((toast) => toast.id !== id));

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-[56] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-y-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex gap-x-3 rounded-md bg-white p-4 shadow-lg ring-1 ring-black/10"
        >
          <MdNotificationsActive className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="electronicArtsTextBold text-sm text-gray-900">Update on an issue you follow</p>
            <p className="mt-1 body-small text-gray-700">
              {toast.title}: {INCIDENT_STATUS_LABELS[toast.status]}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="h-6 w-6 flex-shrink-0 rounded text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <MdClose className="m-auto h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
};
