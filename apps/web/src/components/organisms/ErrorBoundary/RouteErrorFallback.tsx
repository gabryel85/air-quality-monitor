import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FallbackProps } from 'react-error-boundary';

import { cn } from '@/lib/utils';

export function RouteErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const message = error instanceof Error ? error.message : String(error);

  return (
    <section
      role="alert"
      className={cn(
        'border-border bg-surface mx-auto my-12 max-w-prose rounded-lg border p-6',
        'shadow-sm',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="bg-error/10 text-error mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 className="text-ink-primary text-lg font-semibold">{t('states.error.title')}</h2>
          <p className="text-ink-secondary mt-1 text-base">{t('states.error.body')}</p>
          <details className="text-ink-tertiary mt-3 text-sm">
            <summary className="hover:text-ink-secondary cursor-pointer select-none">
              {t('states.technicalDetail')}
            </summary>
            <pre className="bg-subtle mt-2 overflow-x-auto rounded-md p-3 font-mono text-xs">
              {message}
            </pre>
          </details>
          <button
            type="button"
            onClick={resetErrorBoundary}
            className={cn(
              'border-border bg-surface mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3',
              'text-ink-primary text-base font-semibold',
              'duration-fast transition-colors ease-out',
              'hover:bg-subtle hover:border-border-strong',
              'focus-visible:shadow-focus focus-visible:outline-none',
            )}
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            {t('actions.retry')}
          </button>
        </div>
      </div>
    </section>
  );
}
