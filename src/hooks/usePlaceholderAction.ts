import { useCallback } from 'react';
import { useNavigate } from 'react-router';

/**
 * Handler for call-to-action buttons whose destination is not built yet.
 * Mirrors the legacy `navigate('#')`: pushes a history entry for the current
 * page without changing what is rendered.
 */
export const usePlaceholderAction = (): (() => void) => {
  const navigate = useNavigate();
  return useCallback(() => navigate('#'), [navigate]);
};
