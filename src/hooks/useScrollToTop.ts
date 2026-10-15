import { useEffect } from 'react';

/** Scrolls the window to the top once, when the calling component mounts. */
export const useScrollToTop = (): void => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
