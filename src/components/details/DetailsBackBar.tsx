import { BackButton } from '@/components/ui/BackButton';

/** Full-width bar holding the Back button at the top of a details view. */
export const DetailsBackBar = () => (
  <div className="relative">
    <div className="py-3 w-full h-full bg-slate-50 cursor-default text-left">
      <BackButton />
    </div>
  </div>
);
