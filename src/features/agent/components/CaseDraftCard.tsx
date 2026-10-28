import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { CaseDraftInput } from '@/services/ea-api/types';
import { useHelpAgent } from '../agentContext';

type DraftState = 'editing' | 'sent' | 'dismissed';

/** Auto-drafted case the player reviews and edits before sending (L3). */
export const CaseDraftCard = ({ draft }: { draft: CaseDraftInput }) => {
  const { submitCase, state: conversation } = useHelpAgent();
  const [title, setTitle] = useState(draft.title);
  const [summary, setSummary] = useState(draft.summary);
  const [draftState, setDraftState] = useState<DraftState>('editing');
  const titleId = useId();
  const summaryId = useId();
  const isEditing = draftState === 'editing';

  const send = () => {
    setDraftState('sent');
    submitCase({ ...draft, title: title.trim() || draft.title, summary: summary.trim() || draft.summary });
  };

  return (
    <section aria-label="Draft case" className="rounded-lg bg-white p-4 ring-1 ring-gray-300">
      <p className="eyebrow-default text-gray-600">Draft case · review before sending</p>
      <div className="mt-2 space-y-3">
        <div>
          <label htmlFor={titleId} className="electronicArtsTextBold text-xs text-gray-700">
            Title
          </label>
          <input
            id={titleId}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            readOnly={!isEditing}
            className="mt-1 block w-full rounded-md border border-solid border-gray-300 px-2.5 py-1.5 body-small outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 read-only:bg-gray-50"
          />
        </div>
        <div>
          <label htmlFor={summaryId} className="electronicArtsTextBold text-xs text-gray-700">
            Summary
          </label>
          <textarea
            id={summaryId}
            rows={3}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            readOnly={!isEditing}
            className="mt-1 block w-full resize-y rounded-md border border-solid border-gray-300 px-2.5 py-1.5 body-small outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 read-only:bg-gray-50"
          />
        </div>
        <div>
          <h4 className="electronicArtsTextBold text-xs text-gray-700">Attached automatically</h4>
          <ul className="mt-1 space-y-0.5 pl-5">
            {draft.evidence.map((item) => (
              <li key={item} className="list-item list-disc body-small text-gray-800">
                {item}
              </li>
            ))}
          </ul>
        </div>
        {draft.stepsTried.length > 0 && (
          <div>
            <h4 className="electronicArtsTextBold text-xs text-gray-700">Steps you already tried</h4>
            <ul className="mt-1 space-y-0.5 pl-5">
              {draft.stepsTried.map((step) => (
                <li key={step} className="list-item list-disc body-small text-gray-800">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="body-small text-gray-500">
          No screenshots needed. EA already has your platform and game details.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isEditing ? (
          <>
            <Button
              buttonStyle="btn-secondary-solid"
              buttonSize="btn-sm"
              buttonWidth="w-auto"
              onClick={send}
              disabled={conversation.isRunning}
            >
              Send to an advisor
            </Button>
            <Button
              buttonStyle="btn-ghost-solid"
              buttonSize="btn-sm"
              buttonWidth="w-auto"
              onClick={() => setDraftState('dismissed')}
            >
              Not now
            </Button>
          </>
        ) : (
          <p role="status" className="body-small text-gray-600">
            {draftState === 'sent'
              ? 'Sent. An advisor will pick this up from here.'
              : 'Not sent. Tap "Talk to a person" whenever you want an advisor.'}
          </p>
        )}
      </div>
    </section>
  );
};
