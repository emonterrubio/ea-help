import { SCENARIOS, type ScenarioId } from '@/agent/demo/scenarios';

const SUGGESTED: ScenarioId[] = ['content-recovery', 'diagnostics', 'known-issue', 'account-recovery'];

/** Starter prompts shown before the player has typed anything. */
export const SuggestedPrompts = ({ onPick }: { onPick: (prompt: string) => void }) => {
  const prompts = SCENARIOS.filter((scenario) => SUGGESTED.includes(scenario.id));

  return (
    <div>
      <p className="mb-2 body-small text-gray-500">Try asking</p>
      <ul className="flex flex-col gap-y-1.5">
        {prompts.map((scenario) => (
          <li key={scenario.id}>
            <button
              type="button"
              onClick={() => onPick(scenario.prompt)}
              className="w-full rounded-md border border-solid border-gray-200 bg-white px-3 py-2 text-left body-small text-gray-800 hover:border-blue-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {scenario.prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
