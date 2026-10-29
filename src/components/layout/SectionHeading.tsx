import type { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  description?: string;
  /** Optional trailing action (e.g. a "View all" link). */
  action?: ReactNode;
}

/** Large section title with an optional description and trailing action. */
export const SectionHeading = ({ title, description, action }: SectionHeadingProps) => (
  <div className="flex justify-between items-center">
    <div className="mb-2">
      <h2 className="electronicArtsDisplayBold md:text-3xl text-2xl">{title}</h2>
      {description && <p className="my-2 text-base leading-5 tracking-wide">{description}</p>}
    </div>
    {action}
  </div>
);
