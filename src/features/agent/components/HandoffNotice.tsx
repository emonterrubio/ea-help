import { MdOutlineSupportAgent } from 'react-icons/md';
import { Link } from 'react-router';
import { useHelpAgent } from '../agentContext';

interface HandoffNoticeProps {
  advisorName: string;
  summary: string;
  caseId: string;
  caseNumber: string;
  greeting: string;
}

/** Warm handoff: a person joins and starts from the agent's summary, so nothing is re-explained. */
export const HandoffNotice = ({ advisorName, summary, caseId, caseNumber, greeting }: HandoffNoticeProps) => {
  const { close } = useHelpAgent();

  return (
    <section className="space-y-3" aria-label="Handoff to an advisor">
      <div className="rounded-lg border border-solid border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-x-2">
          <MdOutlineSupportAgent className="h-5 w-5 text-green-800" aria-hidden="true" />
          <p className="electronicArtsTextBold text-sm text-green-900">
            {advisorName}, an EA Help advisor (a person), has joined
          </p>
        </div>
        <p className="mt-2 text-sm tracking-wide text-gray-700">
          <span className="electronicArtsTextBold">What {advisorName} already knows: </span>
          {summary}
        </p>
        <p className="mt-2 text-sm tracking-wide text-gray-700">
          Case #{caseNumber} is in{' '}
          <Link to={`/cases/active/${caseId}`} onClick={close} className="text-sm tracking-wide text-blue-700 underline">
            My Cases
          </Link>
          .
        </p>
      </div>
      <div className="max-w-[92%]">
        <p className="mb-1 electronicArtsTextBold text-xs text-gray-700">{advisorName} · EA Help advisor</p>
        <div className="rounded-lg rounded-tl-sm bg-green-100 px-3.5 py-2.5">
          <p className="text-base leading-5 tracking-wide text-gray-900">{greeting}</p>
        </div>
      </div>
    </section>
  );
};
