import type { Infraction, SupportCase } from '@/types/domain';

/** Cases that can still be worked on or resumed (shown as cards on "Active Cases"). */
export const isActiveCase = (supportCase: SupportCase): boolean => supportCase.type === 'active';

/** Archived cases (shown in the "Cases History" table). */
export const isHistoricalCase = (supportCase: SupportCase): boolean => !isActiveCase(supportCase);

/** Infractions still open to dispute (shown as cards on "Active Infractions"). */
export const isOpenInfraction = (infraction: Infraction): boolean => infraction.status === 'open';

/** Closed infractions (shown in the "Infractions History" table). */
export const isHistoricalInfraction = (infraction: Infraction): boolean => !isOpenInfraction(infraction);
