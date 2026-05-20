/* eslint-disable react-refresh/only-export-components -- router config file mixes config + small inline components; not HMR-relevant */
import { lazy, Suspense, type ComponentType, type ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Spinner } from '@/components/atoms/Spinner';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppShell } from '@/templates/AppShell';

/**
 * Lazy routes — only the dashboard ships in the main entry chunk.
 * Notes lives in a separate chunk fetched on first navigation.
 */
const NotesPage = lazy(() => import('@/pages/NotesPage').then((m) => ({ default: m.NotesPage })));

function withSuspense(Component: ComponentType): ReactElement {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Component />
    </Suspense>
  );
}

function PageLoadingFallback() {
  return (
    <div className="flex justify-center py-24">
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        {
          path: 'dashboard',
          element: <DashboardPage />,
          handle: { crumb: () => 'Dashboard' },
        },
        {
          path: 'cities/:cityId/notes',
          element: withSuspense(NotesPage),
          handle: {
            crumb: (params: Readonly<Record<string, string | undefined>>) =>
              `${params['cityId'] ?? ''} · Notes`,
          },
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { future: { v7_relativeSplatPath: true } },
);
