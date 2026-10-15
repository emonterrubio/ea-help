import type { ReactNode } from 'react';

/** Responsive 2/3/4-column grid for game tiles. */
export const GameGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-y-6 sm:gap-x-6 gap-x-3">{children}</div>
);
