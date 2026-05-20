import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useMatches } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { LanguageToggle } from '@/components/molecules/LanguageToggle/LanguageToggle';
import { PollingIndicator } from '@/components/molecules/PollingIndicator';
import { ThemeToggle } from '@/components/molecules/ThemeToggle/ThemeToggle';
import { MobileMenu } from '@/components/organisms/MobileMenu/MobileMenu';
import { selectCitiesError, selectLastUpdatedAt } from '@/features/cities/selectors';
import { FaultModeToggle } from '@/features/mock-db/FaultModeToggle';
import { ResetDbButton } from '@/features/mock-db/ResetDbButton';
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
  const location = useLocation();

  // App-wide data-freshness indicator. Reflects the selected year:
  // current year polls (Live), a past year is frozen (Historical).
  // Hidden until a country + year are chosen — nothing to indicate yet.
  const country = useAppSelector((s) => s.filters.country);
  const year = useAppSelector((s) => s.filters.year);
  const lastUpdatedAt = useAppSelector(selectLastUpdatedAt);
  const citiesError = useAppSelector(selectCitiesError);
  const hasSelection = country !== null && year !== null;
  const isHistorical = year !== null && year < new Date().getFullYear();

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
                to={{ pathname: '/dashboard', search: location.search }}
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
                  to={{ pathname: c.path, search: location.search }}
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
        <div className="flex shrink-0 items-center gap-3">
          {hasSelection ? (
            <PollingIndicator
              lastUpdatedAt={lastUpdatedAt}
              isHistorical={isHistorical}
              isError={Boolean(citiesError)}
              className="max-sm:hidden"
            />
          ) : null}
          {/* Desktop: controls inline. Mobile: collapsed into the sheet menu. */}
          <div className="hidden items-center gap-3 sm:flex">
            <FaultModeToggle />
            <ResetDbButton />
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <MobileMenu
            hasSelection={hasSelection}
            lastUpdatedAt={lastUpdatedAt}
            isHistorical={isHistorical}
            isError={Boolean(citiesError)}
            className="sm:hidden"
          />
        </div>
      </div>
    </header>
  );
}
