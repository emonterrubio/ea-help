import { lazy, Suspense, useState } from 'react';
import { useHelpAgent } from './agentContext';

const HelpAgentPanel = lazy(async () => ({ default: (await import('./components/HelpAgentPanel')).HelpAgentPanel }));

/** Loads the panel code only after the player first opens the agent. */
export const HelpAgentHost = () => {
  const { state } = useHelpAgent();
  const [hasOpened, setHasOpened] = useState(false);
  if (state.isOpen && !hasOpened) setHasOpened(true);

  return hasOpened ? (
    <Suspense fallback={null}>
      <HelpAgentPanel />
    </Suspense>
  ) : null;
};
