import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';

import { AppHeader } from '@/components/organisms/AppHeader/AppHeader';
import { RouteErrorFallback } from '@/components/organisms/ErrorBoundary/RouteErrorFallback';
import { cn } from '@/lib/utils';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="bg-canvas text-ink-primary min-h-screen">
      <a
        href="#main"
        className={cn(
          'sr-only focus:not-sr-only',
          'bg-accent fixed left-2 top-2 z-50 rounded-md px-3 py-2',
          'text-ink-on-accent text-base font-semibold shadow-md',
          'focus-visible:shadow-focus focus-visible:outline-none',
        )}
      >
        Skip to main content
      </a>

      <AppHeader />

      <main id="main" className="max-w-wide mx-auto px-4 py-6 sm:px-6">
        {/*
          Per-route ErrorBoundary keyed by pathname so navigating away from an
          errored route resets the boundary. Errors in one route don't blank
          out the header or break the rest of the app.
        */}
        <ErrorBoundary FallbackComponent={RouteErrorFallback} resetKeys={[location.pathname]}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
