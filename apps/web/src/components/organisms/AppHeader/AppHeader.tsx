import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useMatches } from 'react-router-dom';

import { LanguageToggle } from '@/components/molecules/LanguageToggle/LanguageToggle';
import { ThemeToggle } from '@/components/molecules/ThemeToggle/ThemeToggle';
import { cn } from '@/lib/utils';

interface RouteHandle {
  readonly crumb?: (params: Readonly<Record<string, string | undefined>>) => string;
}

function isRouteHandle(value: unknown): value is RouteHandle {
  return typeof value === 'object' && value !== null && 'crumb' in value;
}

export function AppHeader() {
  const { t } = useTranslation();
  const matches = useMatches();

  const crumbs = matches
    .map((m) => {
      if (!isRouteHandle(m.handle) || !m.handle.crumb) return null;
      return {
        path: m.pathname,
        label: m.handle.crumb(m.params),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <header
      className={cn(
        'border-border-subtle bg-canvas/80 sticky top-0 z-30 border-b backdrop-blur',
        'supports-[backdrop-filter]:bg-canvas/70',
      )}
    >
      <div className="max-w-wide mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1 text-base">
            <li>
              <Link
                to="/dashboard"
                className={cn(
                  '-ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1',
                  'text-ink-primary font-semibold',
                  'hover:bg-subtle',
                  'focus-visible:shadow-focus focus-visible:outline-none',
                )}
              >
                <span aria-hidden="true" className="text-accent">
                  ●
                </span>
                {t('app.title')}
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.path} className="flex min-w-0 items-center gap-1">
                <ChevronRight
                  className="text-ink-tertiary h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <Link
                  to={c.path}
                  className={cn(
                    'text-ink-secondary truncate rounded-md px-2 py-1',
                    'hover:bg-subtle hover:text-ink-primary',
                    'focus-visible:shadow-focus focus-visible:outline-none',
                  )}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
