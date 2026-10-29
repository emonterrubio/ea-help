import { MdOutlineShield } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { useHelpAgent } from '@/features/agent/agentContext';

/** Account recovery entry point on My Account: opens the Help Agent's secure recovery flow. */
export const AccountRecoveryCallout = () => {
  const { open } = useHelpAgent();

  return (
    <section
      aria-labelledby="account-recovery-heading"
      className="mt-10 flex flex-col gap-4 rounded-md bg-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-x-3">
        <MdOutlineShield className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-700" aria-hidden="true" />
        <div>
          <h2 id="account-recovery-heading" className="electronicArtsTextBold text-lg text-gray-900">
            Can&apos;t sign in, or think someone else got in?
          </h2>
          <p className="electronicArtsTextRegular mt-1 text-base text-gray-700">
            The Help Agent checks it&apos;s you, then resets your password and signs out other devices. If anything
            looks risky, it goes straight to a person and nothing is changed.
          </p>
        </div>
      </div>
      <div className="w-full shrink-0 whitespace-nowrap sm:w-auto">
        <Button
          buttonStyle="btn-secondary-solid"
          buttonSize="btn-md"
          buttonWidth="w-full sm:w-auto"
          onClick={() => open({ scenarioId: 'account-recovery' })}
        >
          Get help signing in
        </Button>
      </div>
    </section>
  );
};
