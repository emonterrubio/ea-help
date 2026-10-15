import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** Horizontal padding/margin classes; pages historically varied slightly. */
  className?: string;
}

/** Centered, max-width content column used under every page hero. */
export const PageContainer = ({ children, className = 'sm:mx-auto sm:px-10 px-4' }: PageContainerProps) => (
  <div className={`${className} lg:max-w-5xl md:max-w-4xl max-w-2xl`}>{children}</div>
);
