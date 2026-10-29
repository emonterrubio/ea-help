import { useEffect, useRef, useState } from 'react';
import { executeAction } from '@/agent/actions/execute';
import type { OneClickFix } from '@/agent/diagnostics/types';
import { Button } from '@/components/ui/Button';
import { AutonomyBadge } from './AutonomyBadge';

type FixState =
  | { phase: 'idle' }
  | { phase: 'confirming' }
  | { phase: 'applying' }
  | { phase: 'applied'; referenceId: string }
  | { phase: 'rejected'; reasons: string[] };

interface OneClickFixPanelProps {
  fix: OneClickFix;
  gameId: string;
  onApplied: (referenceId: string) => void;
}

/** A diagnostic step the agent can apply after the player confirms (L2), with a receipt. */
export const OneClickFixPanel = ({ fix, gameId, onApplied }: OneClickFixPanelProps) => {
  const [fixState, setFixState] = useState<FixState>({ phase: 'idle' });
  const confirmRef = useRef<HTMLDivElement>(null);

  // Bring the confirmation into view (and focus) so the player sees what will change.
  useEffect(() => {
    if (fixState.phase === 'confirming') confirmRef.current?.focus();
  }, [fixState.phase]);

  const apply = async () => {
    setFixState({ phase: 'applying' });
    // The rules engine re-checks the fix here, so a repeat or ineligible fix is refused.
    const outcome = await executeAction({ kind: fix.kind, gameId });
    if (outcome.status === 'applied') {
      setFixState({ phase: 'applied', referenceId: outcome.receipt.referenceId });
      onApplied(outcome.receipt.referenceId);
    } else {
      setFixState({ phase: 'rejected', reasons: outcome.reasons });
    }
  };

  switch (fixState.phase) {
    case 'idle':
      return (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            buttonStyle="btn-secondary-outline"
            buttonSize="btn-sm"
            buttonWidth="w-auto"
            onClick={() => setFixState({ phase: 'confirming' })}
          >
            {fix.label}
          </Button>
          <AutonomyBadge level="L2" />
        </div>
      );
    case 'confirming':
    case 'applying':
      return (
        <div
          ref={confirmRef}
          tabIndex={-1}
          className="mt-3 rounded-md bg-amber-50 p-3 outline-none ring-1 ring-amber-200"
        >
          <p className="electronicArtsTextBold text-xs text-amber-900">This will:</p>
          <ul className="mt-1 space-y-0.5 pl-5">
            {fix.changes.map((change) => (
              <li key={change} className="list-item list-disc text-sm tracking-wide text-gray-800">
                {change}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              buttonStyle="btn-secondary-solid"
              buttonSize="btn-sm"
              buttonWidth="w-auto"
              onClick={() => void apply()}
              disabled={fixState.phase === 'applying'}
            >
              Confirm
            </Button>
            <Button
              buttonStyle="btn-ghost-solid"
              buttonSize="btn-sm"
              buttonWidth="w-auto"
              onClick={() => setFixState({ phase: 'idle' })}
              disabled={fixState.phase === 'applying'}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    case 'applied':
      return (
        <p role="status" className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm tracking-wide text-green-900">
          Done. Reference ID {fixState.referenceId}. Try the game again, then tell me how it went.
        </p>
      );
    case 'rejected':
      return (
        <p role="status" className="mt-3 rounded-md bg-gray-100 px-3 py-2 text-sm tracking-wide text-gray-800">
          I can&apos;t apply this fix right now: {fixState.reasons.join(' ')} Nothing was changed.
        </p>
      );
  }
};
