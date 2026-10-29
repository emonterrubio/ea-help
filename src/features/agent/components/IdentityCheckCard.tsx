import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { DEMO_EMAIL_CODE, purchaseChallenge, verifyIdentityFactor } from '@/services/ea-api/security';
import type { IdentityFactor } from '@/services/ea-api/types';
import { useHelpAgent } from '../agentContext';

type FactorState = 'idle' | 'checking' | 'failed' | 'passed';

const Passed = ({ label }: { label: string }) => (
  <p className="flex items-center gap-x-2 text-sm tracking-wide text-green-800">
    <MdCheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
    {label}
  </p>
);

const useFactor = (sessionId: string, factor: IdentityFactor, onPassed: () => void) => {
  const [state, setState] = useState<FactorState>('idle');
  const check = async (answer: string) => {
    setState('checking');
    const passed = await verifyIdentityFactor(sessionId, factor, answer);
    setState(passed ? 'passed' : 'failed');
    if (passed) onPassed();
  };
  return { state, check };
};

interface FactorProps {
  sessionId: string;
  onPassed: () => void;
}

const EmailCodeFactor = ({ sessionId, onPassed }: FactorProps) => {
  const { state, check } = useFactor(sessionId, 'email_code', onPassed);
  const [code, setCode] = useState('');
  const inputId = useId();
  const errorId = useId();
  if (state === 'passed') return <Passed label="Email code verified" />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void check(code);
  };

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <label htmlFor={inputId} className="electronicArtsTextBold text-sm text-gray-900">
        Enter the 6-digit code we emailed you
      </label>
      <p className="text-sm tracking-wide text-gray-500" data-demo-chrome>
        Prototype: the code is {DEMO_EMAIL_CODE}
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          id={inputId}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          aria-invalid={state === 'failed'}
          aria-describedby={state === 'failed' ? errorId : undefined}
          className="w-32 rounded-md border border-solid border-gray-300 px-2.5 py-1.5 text-sm tracking-wide outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
        <Button
          type="submit"
          buttonStyle="btn-secondary-solid"
          buttonSize="btn-sm"
          buttonWidth="w-auto"
          disabled={code.trim().length === 0 || state === 'checking'}
        >
          Verify code
        </Button>
      </div>
      {state === 'failed' && (
        <p id={errorId} role="alert" className="text-sm tracking-wide text-rose-800">
          That code doesn&apos;t match. Check the latest email from EA and try again.
        </p>
      )}
    </form>
  );
};

const PurchaseFactor = ({ sessionId, onPassed }: FactorProps) => {
  const { state, check } = useFactor(sessionId, 'purchase_history', onPassed);
  const [answer, setAnswer] = useState('');
  const challenge = purchaseChallenge();
  const baseId = useId();
  if (state === 'passed') return <Passed label="Recent purchase confirmed" />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void check(answer);
  };

  return (
    <form onSubmit={submit}>
      <fieldset>
        <legend className="electronicArtsTextBold text-sm text-gray-900">{challenge.question}</legend>
        <div className="mt-2 space-y-1.5">
          {challenge.options.map((option) => {
            const id = `${baseId}-${option.value}`;
            return (
              <div key={option.value} className="flex items-center gap-x-2">
                <input
                  id={id}
                  type="radio"
                  name={baseId}
                  value={option.value}
                  checked={answer === option.value}
                  onChange={() => setAnswer(option.value)}
                  className="h-4 w-4 accent-blue-700"
                />
                <label htmlFor={id} className="text-sm tracking-wide text-gray-800">
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-2">
        <Button
          type="submit"
          buttonStyle="btn-secondary-solid"
          buttonSize="btn-sm"
          buttonWidth="w-auto"
          disabled={!answer || state === 'checking'}
        >
          Confirm purchase
        </Button>
      </div>
      {state === 'failed' && (
        <p role="alert" className="mt-1.5 text-sm tracking-wide text-rose-800">
          That isn&apos;t a recent purchase on this account. Try again.
        </p>
      )}
    </form>
  );
};

const FACTOR_COUNT = 2;

/** Identity checks for account recovery. EA checks the answers; the agent only sees pass or fail. */
export const IdentityCheckCard = ({ sessionId }: { sessionId: string }) => {
  const { reportIdentityVerified } = useHelpAgent();
  const [passedCount, setPassedCount] = useState(0);
  const reported = useRef(false);
  const onPassed = () => setPassedCount((count) => count + 1);

  useEffect(() => {
    if (passedCount < FACTOR_COUNT || reported.current) return;
    reported.current = true;
    reportIdentityVerified(sessionId);
  }, [passedCount, reportIdentityVerified, sessionId]);

  return (
    <section aria-label="Confirm it's you" className="rounded-lg bg-white p-4 ring-1 ring-amber-300">
      <p className="text-xs font-bold uppercase leading-6 tracking-wider text-amber-900">
        Confirm it&apos;s you · {passedCount} of {FACTOR_COUNT} done
      </p>
      <p className="mb-3 text-sm tracking-wide text-gray-600">We&apos;ll never ask for your password.</p>
      <div className="space-y-4">
        <EmailCodeFactor sessionId={sessionId} onPassed={onPassed} />
        <PurchaseFactor sessionId={sessionId} onPassed={onPassed} />
      </div>
    </section>
  );
};
