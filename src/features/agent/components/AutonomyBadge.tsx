import { AUTONOMY_LEVELS, type AutonomyLevel } from '@/agent/policy/autonomy';

const LEVEL_CLASSES: Record<AutonomyLevel, string> = {
  L0: 'bg-slate-100 text-slate-700',
  L1: 'bg-sky-100 text-sky-800',
  L2: 'bg-amber-100 text-amber-900',
  L3: 'bg-rose-100 text-rose-800',
};

/** Shows the autonomy level behind an agent response, so players see what the AI may do. */
export const AutonomyBadge = ({ level }: { level: AutonomyLevel }) => {
  const info = AUTONOMY_LEVELS[level];
  return (
    <span
      className={`inline-flex items-center gap-x-1 rounded px-1.5 py-0.5 text-[0.6875rem] electronicArtsTextBold tracking-wide ${LEVEL_CLASSES[level]}`}
      title={`${info.agentMay}. You see: ${info.playerSees.toLowerCase()}.`}
    >
      {info.level} · {info.name}
    </span>
  );
};
