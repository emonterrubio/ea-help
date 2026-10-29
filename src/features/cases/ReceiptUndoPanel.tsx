import { useState } from 'react';
import { undoAction } from '@/agent/actions/execute';
import { Button } from '@/components/ui/Button';
import { findReceipt } from '@/services/ea-api/receipts';
import { useDemoState } from '@/services/ea-api/store';

/** Undo for a change the Help Agent applied (reversibility guardrail). Hidden once undone. */
export const ReceiptUndoPanel = ({ referenceId }: { referenceId: string }) => {
  const receipt = findReceipt(referenceId, useDemoState());
  const [isUndoing, setIsUndoing] = useState(false);
  if (!receipt?.undoable || receipt.undoneAt) return null;

  const undo = async () => {
    setIsUndoing(true);
    await undoAction(referenceId);
    setIsUndoing(false);
  };

  return (
    <section
      aria-labelledby="receipt-undo-heading"
      className="my-8 flex flex-col gap-4 rounded-md border border-solid border-slate-300 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h3 id="receipt-undo-heading" className="electronicArtsTextBold text-base text-gray-900">
          Changed your mind?
        </h3>
        <p className="mt-1 body-small text-gray-700">
          Undo reverses this change on your account. Reference ID {receipt.referenceId}.
        </p>
      </div>
      <Button
        buttonStyle="btn-secondary-outline"
        buttonSize="btn-md"
        buttonWidth="w-full sm:w-auto"
        onClick={() => void undo()}
        disabled={isUndoing}
      >
        Undo this change
      </Button>
    </section>
  );
};
