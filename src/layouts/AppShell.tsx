import { Outlet } from 'react-router';
import { Footer } from '@/components/navigation/Footer';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TopNav } from '@/components/navigation/TopNav';
import { DemoControls } from '@/features/demo-controls/DemoControls';
import { HelpAgentHost } from '@/features/agent/HelpAgentHost';
import { HelpAgentLauncher } from '@/features/agent/HelpAgentLauncher';
import { HelpAgentProvider } from '@/features/agent/HelpAgentProvider';
import { useAiLayer } from '@/features/flags/aiLayer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

/**
 * Persistent chrome: mobile drawer, desktop top nav, routed content and footer.
 * With the AI layer on, the Help Agent launcher and panel are added on top of v1.
 */
export const AppShell = () => {
  useScrollToTop();
  const aiEnabled = useAiLayer();

  return (
    <HelpAgentProvider enabled={aiEnabled}>
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
        {aiEnabled && (
          <>
            <HelpAgentLauncher />
            <HelpAgentHost />
          </>
        )}
        <DemoControls />
      </div>
    </HelpAgentProvider>
  );
};
