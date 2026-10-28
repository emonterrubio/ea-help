import { MdCheck } from 'react-icons/md';

interface StatusLineProps {
  text: string;
  state: 'active' | 'complete';
}

/** Narrated step ("Checking your purchases…") so waiting reads as progress (PRD principle 1). */
export const StatusLine = ({ text, state }: StatusLineProps) => (
  <div className="flex items-center gap-x-2 body-small text-gray-500">
    {state === 'active' ? (
      <span
        aria-hidden="true"
        className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin motion-reduce:animate-none"
      />
    ) : (
      <MdCheck className="h-3.5 w-3.5 flex-shrink-0 text-green-700" aria-hidden="true" />
    )}
    <span>
      <span className="sr-only">{state === 'active' ? 'In progress: ' : 'Done: '}</span>
      {text}
    </span>
  </div>
);
