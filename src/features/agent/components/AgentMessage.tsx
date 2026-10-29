import type { AutonomyLevel } from '@/agent/policy/autonomy';
import type { Citation } from '@/agent/protocol';
import { AiBadge } from './AiBadge';
import { AutonomyBadge } from './AutonomyBadge';

const citationLabel = (citation: Citation): string => {
  switch (citation.kind) {
    case 'article':
      return citation.title;
    case 'purchase':
    case 'policy':
    case 'incident':
      return citation.label;
  }
};

interface AgentMessageProps {
  text: string;
  citations?: Citation[];
  level?: AutonomyLevel;
}

/** A reply from the agent, labelled as AI, with its sources and autonomy level. */
export const AgentMessage = ({ text, citations = [], level }: AgentMessageProps) => (
  <div className="max-w-[92%]">
    <div className="mb-1 flex items-center gap-x-2">
      <span className="electronicArtsTextBold text-xs text-gray-700">EA Help Agent</span>
      <AiBadge />
      {level && <AutonomyBadge level={level} />}
    </div>
    <div className="rounded-lg rounded-tl-sm bg-slate-100 px-3.5 py-2.5">
      <p className="text-sm leading-5 tracking-wide text-gray-900">{text}</p>
      {citations.length > 0 && (
        <div className="mt-2">
          <p className="sr-only">Sources</p>
          <ul className="flex flex-wrap gap-1.5">
            {citations.map((citation) => (
              <li
                key={`${citation.kind}-${citationLabel(citation)}`}
                className="rounded-full border border-solid border-slate-300 bg-white px-2 py-0.5 text-sm tracking-wide text-slate-700"
              >
                {citationLabel(citation)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);
