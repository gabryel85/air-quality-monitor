import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto my-24 max-w-prose text-center">
      <span className="bg-subtle text-ink-tertiary inline-flex h-12 w-12 items-center justify-center rounded-full">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="text-ink-primary mt-4 text-2xl font-semibold tracking-tight">404</h1>
      <p className="text-ink-secondary mt-1 text-base">This page does not exist.</p>
      <Link
        to="/dashboard"
        className={cn(
          'bg-accent mt-6 inline-flex h-10 items-center justify-center rounded-md px-4',
          'text-ink-on-accent text-base font-semibold',
          'duration-fast hover:bg-accent-hover transition-colors ease-out',
          'focus-visible:shadow-focus focus-visible:outline-none',
        )}
      >
        {t('app.title')}
      </Link>
    </section>
  );
}
