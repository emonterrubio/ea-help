import { useMemo } from 'react';
import cases from '@/data/cases';
import { useAiLayer } from '@/features/flags/aiLayer';
import { findAnyCase, selectAllCases, type AnyCase } from '@/services/ea-api/cases';
import { useDemoState } from '@/services/ea-api/store';

/** v1 cases, plus agent-created cases when the AI layer is on. */
export const useAllCases = (): AnyCase[] => {
  const aiEnabled = useAiLayer();
  const state = useDemoState();
  return useMemo(() => (aiEnabled ? selectAllCases(state) : cases), [aiEnabled, state]);
};

export const useCase = (caseId: string | undefined): AnyCase | undefined => {
  const aiEnabled = useAiLayer();
  const state = useDemoState();
  return useMemo(
    () => (aiEnabled ? findAnyCase(caseId, state) : cases.find((item) => item.id === caseId)),
    [aiEnabled, caseId, state],
  );
};
