import { MdOutlineSupportAgent } from 'react-icons/md';

interface HandoffNoticeProps {
  advisorName: string;
  summary: string;
}

/** Warm handoff: the human advisor starts from the agent's summary, so nothing is re-explained. */
export const HandoffNotice = ({ advisorName, summary }: HandoffNoticeProps) => (
  <section
    className="rounded-lg border border-solid border-green-200 bg-green-50 p-4"
    aria-label="Handoff to an advisor"
  >
    <div className="flex items-center gap-x-2">
      <MdOutlineSupportAgent className="h-5 w-5 text-green-800" aria-hidden="true" />
      <p className="electronicArtsTextBold text-sm text-green-900">
        {advisorName}, an EA Help advisor (a person), is joining
      </p>
    </div>
    <p className="mt-2 body-small text-gray-700">
      <span className="electronicArtsTextBold">What {advisorName} already knows: </span>
      {summary}
    </p>
  </section>
);
