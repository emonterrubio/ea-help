import { NavLink } from 'react-router';
import { tabClassName } from './navLinkClasses';

export interface SectionTab {
  /** Path relative to the parent route (e.g. `active`). */
  to: string;
  label: string;
  /** Extra classes for a single tab (legacy per-tab styling). */
  className?: string;
}

interface SectionTabsProps {
  label: string;
  tabs: SectionTab[];
}

const BASE =
  'electronicArtsTextRegular text-base border-transparent inline-flex items-center px-1 pt-1 border-solid border-b-4 transition duration-150 ease-in-out';

/** Secondary underline tabs (e.g. Active / History) for a section layout. */
export const SectionTabs = ({ label, tabs }: SectionTabsProps) => (
  <nav aria-label={label} className="flex mt-4 space-x-6 h-10">
    {tabs.map((tab) => (
      <NavLink key={tab.to} to={tab.to} end className={tabClassName(tab.className ? `${BASE} ${tab.className}` : BASE)}>
        {tab.label}
      </NavLink>
    ))}
  </nav>
);
