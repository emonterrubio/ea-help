import { MdAutoAwesome } from 'react-icons/md';
import { useHelpAgent } from './agentContext';

/** Floating entry point to the Help Agent, available on every page while the AI layer is on. */
export const HelpAgentLauncher = () => {
  const { state, open } = useHelpAgent();
  if (state.isOpen) return null;

  return (
    <button
      type="button"
      onClick={() => open()}
      aria-haspopup="dialog"
      className="fixed bottom-4 right-4 z-[55] flex items-center gap-x-2 rounded-full bg-blue-700 px-4 py-3 text-white shadow-lg hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 print:hidden"
    >
      <MdAutoAwesome className="h-5 w-5" aria-hidden="true" />
      <span className="electronicArtsTextBold text-sm tracking-wide">Ask the Help Agent</span>
    </button>
  );
};
