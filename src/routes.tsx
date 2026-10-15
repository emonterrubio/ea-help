import type { RouteObject } from 'react-router';
import { AppShell } from '@/layouts/AppShell';
import { HomePage } from '@/pages/HomePage';

/**
 * Route table. The home page is bundled eagerly; everything else is code-split.
 * Paths are unchanged from the legacy app.
 */
export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'game',
        lazy: async () => ({ Component: (await import('@/components/sections/FeaturedGames')).FeaturedGames }),
      },
      { path: 'game/:gameId', lazy: async () => ({ Component: (await import('@/pages/GamePage')).GamePage }) },
      { path: 'games', lazy: async () => ({ Component: (await import('@/pages/AllGamesPage')).AllGamesPage }) },
      { path: 'eagames', lazy: async () => ({ Component: (await import('@/pages/AllEAGamesPage')).AllEAGamesPage }) },
      { path: 'topic', lazy: async () => ({ Component: (await import('@/components/sections/Topics')).Topics }) },
      { path: 'topic/:topicId', lazy: async () => ({ Component: (await import('@/pages/TopicPage')).TopicPage }) },
      {
        path: 'cases',
        lazy: async () => ({ Component: (await import('@/layouts/CasesLayout')).CasesLayout }),
        children: [
          {
            path: 'active',
            lazy: async () => ({ Component: (await import('@/pages/ActiveCasesPage')).ActiveCasesPage }),
          },
          {
            path: 'active/:caseId',
            lazy: async () => ({ Component: (await import('@/pages/CaseDetailsPage')).CaseDetailsPage }),
          },
          {
            path: 'history',
            lazy: async () => ({ Component: (await import('@/pages/HistoryCasesPage')).HistoryCasesPage }),
          },
          {
            path: 'history/:caseId',
            lazy: async () => ({ Component: (await import('@/pages/CaseDetailsPage')).CaseDetailsPage }),
          },
        ],
      },
      {
        path: 'infractions',
        lazy: async () => ({ Component: (await import('@/layouts/InfractionsLayout')).InfractionsLayout }),
        children: [
          {
            path: 'active',
            lazy: async () => ({ Component: (await import('@/pages/ActiveInfractionsPage')).ActiveInfractionsPage }),
          },
          {
            path: 'active/:infractionId',
            lazy: async () => ({ Component: (await import('@/pages/InfractionDetailsPage')).InfractionDetailsPage }),
          },
          {
            path: 'history',
            lazy: async () => ({ Component: (await import('@/pages/HistoryInfractionsPage')).HistoryInfractionsPage }),
          },
          {
            path: 'history/:infractionId',
            lazy: async () => ({ Component: (await import('@/pages/InfractionDetailsPage')).InfractionDetailsPage }),
          },
        ],
      },
      { path: 'account', lazy: async () => ({ Component: (await import('@/pages/AccountPage')).AccountPage }) },
      { path: '*', lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }) },
    ],
  },
];
