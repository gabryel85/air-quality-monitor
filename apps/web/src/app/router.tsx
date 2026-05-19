import { createBrowserRouter, Navigate } from 'react-router-dom';

import { DashboardPage } from '@/pages/DashboardPage';
import { NotesPage } from '@/pages/NotesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppShell } from '@/templates/AppShell';

export const router = createBrowserRouter([
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
        element: <NotesPage />,
        handle: {
          crumb: (params: Readonly<Record<string, string | undefined>>) =>
            `${params['cityId'] ?? ''} · Notes`,
        },
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
