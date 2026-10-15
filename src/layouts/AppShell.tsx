import { Outlet } from 'react-router';
import { Footer } from '@/components/navigation/Footer';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TopNav } from '@/components/navigation/TopNav';
import { useScrollToTop } from '@/hooks/useScrollToTop';

/** Persistent chrome: mobile drawer, desktop top nav, routed content and footer. */
export const AppShell = () => {
  useScrollToTop();

  return (
    <div className="App">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:rounded-md body-default"
      >
        Skip to main content
      </a>
      <div className="md:hidden block">
        <Sidebar />
      </div>
      <TopNav />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
