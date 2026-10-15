import type { MouseEvent, ReactNode } from 'react';

interface PlaceholderLinkProps {
  children: ReactNode;
  className?: string;
}

const preventNavigation = (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault();

/**
 * Link whose destination does not exist yet. Focusable and announced as a link,
 * but clicking it does nothing (the legacy app used `href="javascript:;"`, which
 * React 19 blocks).
 */
export const PlaceholderLink = ({ children, className }: PlaceholderLinkProps) => (
  // Intentional: a real link target will replace `#` once the destination exists.
  // eslint-disable-next-line jsx-a11y/anchor-is-valid
  <a href="#" onClick={preventNavigation} className={className}>
    {children}
  </a>
);
