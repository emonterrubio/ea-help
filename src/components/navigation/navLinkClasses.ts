const ACTIVE = 'border-red-600 text-gray-900';
const INACTIVE = 'text-gray-900 hover:border-gray-300 hover:text-gray-700';

/** Builds a `className` callback for React Router's `NavLink` (underline-tab style). */
export const tabClassName =
  (base: string) =>
  ({ isActive }: { isActive: boolean }): string =>
    `${base} ${isActive ? ACTIVE : INACTIVE}`;
