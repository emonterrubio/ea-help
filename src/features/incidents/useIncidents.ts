import { useMemo } from 'react';
import { findIncident, selectActiveIncidents } from '@/services/ea-api/api';
import { useDemoState } from '@/services/ea-api/store';
import type { Incident } from '@/services/ea-api/types';

/** Unresolved incidents for the given games (defaults to the player's games), kept live. */
export const useActiveIncidents = (gameIds?: readonly string[]): Incident[] => {
  const { incidentStatus } = useDemoState();
  return useMemo(() => selectActiveIncidents(incidentStatus, gameIds), [incidentStatus, gameIds]);
};

/** One incident with its live status, including once it is resolved. */
export const useIncident = (incidentId: string): Incident | undefined => {
  const { incidentStatus } = useDemoState();
  return useMemo(() => findIncident(incidentId, incidentStatus), [incidentId, incidentStatus]);
};

export const useIsFollowing = (incidentId: string): boolean => useDemoState().followedIncidentIds.includes(incidentId);
