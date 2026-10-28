import { MdAutoAwesome } from 'react-icons/md';

interface ZeroResultRecoveryProps {
  query: string;
  onAskAgent: () => void;
}

/** No good answer means an offer to start the Help Agent, not an empty page. */
export const ZeroResultRecovery = ({ query, onAskAgent }: ZeroResultRecoveryProps) => (
  <div className="rounded-md bg-slate-50 p-3">
    <p className="body-small text-gray-700">
      No articles match “{query}”. The Help Agent can work through it with you.
    </p>
    <button
      type="button"
      onClick={onAskAgent}
      className="mt-2 inline-flex items-center gap-x-1.5 rounded-md bg-blue-700 px-3 py-1.5 electronicArtsTextBold text-xs tracking-wide text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
    >
      <MdAutoAwesome className="h-4 w-4" aria-hidden="true" />
      Ask the Help Agent<span className="sr-only"> about this search</span>
    </button>
  </div>
);
