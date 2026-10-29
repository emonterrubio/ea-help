import { useState } from 'react';
import type { ProposedAction } from '@/agent/actions/types';
import type { PreviewDetail } from '@/agent/protocol';
import { Button } from '@/components/ui/Button';
import { useHelpAgent } from '../agentContext';

interface ActionPreviewCardProps {
  action: ProposedAction;
  title: string;
  details: PreviewDetail[];
  changes: string[];
  confirmLabel: string;
}

type PreviewState = 'pending' | 'confirmed' | 'dismissed';

/** L2 preview: exactly what will change. Nothing happens until the player confirms. */
export const ActionPreviewCard = ({ action, title, details, changes, confirmLabel }: ActionPreviewCardProps) => {
  const { confirmAction, state: conversation } = useHelpAgent();
  const [previewState, setPreviewState] = useState<PreviewState>('pending');

  const confirm = () => {
    setPreviewState('confirmed');
    confirmAction(action, confirmLabel);
  };

  return (
    <section aria-label={`Preview: ${title}`} className="rounded-lg bg-white p-4 ring-1 ring-amber-300">
      <p className="text-xs font-bold uppercase leading-6 tracking-wider text-amber-900">Review before anything changes</p>
      <h3 className="electronicArtsTextBold text-base text-gray-900">{title}</h3>
      {/* dt/dd carry the type classes: the legacy reset styles those elements directly. */}
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {details.map((detail) => (
          <div key={detail.label} className="contents">
            <dt className="text-sm tracking-wide text-gray-500">{detail.label}</dt>
            <dd className="text-sm tracking-wide text-gray-900">{detail.value}</dd>
          </div>
        ))}
      </dl>
      <h4 className="mt-3 electronicArtsTextBold text-xs text-gray-700">What will change</h4>
      <ul className="mt-1 space-y-0.5 pl-5">
        {changes.map((change) => (
          <li key={change} className="list-item list-disc text-sm tracking-wide text-gray-800">
            {change}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {previewState === 'pending' ? (
          <>
            <Button
              buttonStyle="btn-secondary-solid"
              buttonSize="btn-sm"
              buttonWidth="w-auto"
              onClick={confirm}
              disabled={conversation.isRunning}
            >
              {confirmLabel}
            </Button>
            <Button
              buttonStyle="btn-ghost-solid"
              buttonSize="btn-sm"
              buttonWidth="w-auto"
              onClick={() => setPreviewState('dismissed')}
            >
              Not now
            </Button>
          </>
        ) : (
          <p role="status" className="text-sm tracking-wide text-gray-600">
            {previewState === 'confirmed' ? 'Confirmed.' : 'Nothing was changed.'}
          </p>
        )}
      </div>
    </section>
  );
};
