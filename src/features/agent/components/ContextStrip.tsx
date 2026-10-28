import type { AgentContext } from '@/agent/protocol';

/** What the agent already knows, so the player never has to say it (PRD goal 2). */
export const ContextStrip = ({ context }: { context: AgentContext }) => {
  const facts = [
    context.platform,
    `${context.ownedGames.length} games`,
    ...(context.activeIncidentIds.length > 0 ? [`${context.activeIncidentIds.length} known issue`] : []),
  ];

  return (
    <div className="flex items-center gap-x-2 border-0 border-b border-solid border-gray-100 bg-slate-50 px-4 py-2">
      <span className="sr-only body-small text-gray-500 sm:not-sr-only sm:whitespace-nowrap">Using your account:</span>
      <ul className="flex flex-wrap gap-1.5">
        {facts.map((fact) => (
          <li key={fact} className="rounded-full bg-white px-2 py-0.5 body-small text-gray-700 ring-1 ring-gray-200">
            {fact}
          </li>
        ))}
      </ul>
    </div>
  );
};
