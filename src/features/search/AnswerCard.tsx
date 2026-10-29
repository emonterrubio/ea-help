import type { GroundedAnswer } from '@/agent/knowledge/search';
import { AiBadge } from '@/features/agent/components/AiBadge';

interface AnswerCardProps {
  answer: GroundedAnswer;
  onAskFollowUp: (() => void) | null;
}

/** The answer before the links: a short, cited answer above the article list. */
export const AnswerCard = ({ answer, onAskFollowUp }: AnswerCardProps) => (
  <section aria-label="Suggested answer" className="mb-2 rounded-md bg-blue-50 p-3">
    <div className="flex items-center gap-x-2">
      <span className="text-xs font-bold uppercase leading-6 tracking-wider text-blue-900">Answer</span>
      <AiBadge />
    </div>
    <p className="mt-1 text-sm tracking-wide text-gray-900">{answer.text}</p>
    <p className="mt-2 text-sm tracking-wide text-gray-600">
      Source: <cite className="not-italic electronicArtsTextBold">{answer.article.title}</cite>
    </p>
    {onAskFollowUp && (
      <button
        type="button"
        onClick={onAskFollowUp}
        className="mt-2 text-sm tracking-wide text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        Ask the Help Agent a follow-up
      </button>
    )}
  </section>
);
