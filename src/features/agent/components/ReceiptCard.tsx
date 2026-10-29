import { useState } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { Link } from 'react-router';
import { undoAction } from '@/agent/actions/execute';
import { Button } from '@/components/ui/Button';
import { findReceipt } from '@/services/ea-api/receipts';
import { useDemoState } from '@/services/ea-api/store';
import { useHelpAgent } from '../agentContext';

interface ReceiptCardProps {
  referenceId: string;
  title: string;
  appliedAt: string;
  undoable: boolean;
  caseId?: string;
}

const formatAppliedAt = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Proof of an applied L2 change: reference ID, time, where it's recorded, and undo. */
export const ReceiptCard = ({ referenceId, title, appliedAt, undoable, caseId }: ReceiptCardProps) => {
  const { close } = useHelpAgent();
  const undoneAt = findReceipt(referenceId, useDemoState())?.undoneAt;
  const [isUndoing, setIsUndoing] = useState(false);

  const undo = async () => {
    setIsUndoing(true);
    await undoAction(referenceId);
    setIsUndoing(false);
  };

  return (
    <section aria-label="Receipt" className="rounded-lg bg-green-50 p-4 ring-1 ring-green-200">
      <div className="flex items-start gap-x-2">
        <MdCheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" aria-hidden="true" />
        <h3 className="electronicArtsTextBold text-sm text-green-900">{title}</h3>
      </div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-sm tracking-wide text-gray-600">Reference ID</dt>
        <dd className="text-sm tracking-wide text-gray-900">{referenceId}</dd>
        <dt className="text-sm tracking-wide text-gray-600">Applied</dt>
        <dd className="text-sm tracking-wide text-gray-900">{formatAppliedAt(appliedAt)}</dd>
      </dl>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {caseId && (
          <Link to={`/cases/active/${caseId}`} onClick={close} className="text-sm tracking-wide text-blue-700 underline">
            View in My Cases
          </Link>
        )}
        {undoable &&
          (undoneAt ? (
            <p role="status" className="text-sm tracking-wide text-gray-700">
              Undone. The change was reversed.
            </p>
          ) : (
            <Button
              buttonStyle="btn-secondary-outline"
              buttonSize="btn-sm"
              buttonWidth="w-auto"
              onClick={() => void undo()}
              disabled={isUndoing}
            >
              Undo
            </Button>
          ))}
      </div>
    </section>
  );
};
