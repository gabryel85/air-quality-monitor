/**
 * ErrorState — molecule.
 *
 * Inline error block used inside data containers (table area, chart area,
 * notes list). Differs from RouteErrorFallback (organism) which catches
 * unhandled render errors at the route level — this is for *expected*
 * errors (fetch failed, 503, network down) where the surrounding page
 * chrome stays intact.
 *
 *   <ErrorState onRetry={refetch} technicalDetail={error} />
 */

import { AlertTriangle, Lightbulb, RefreshCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  readonly title?: string;
  readonly body?: string;
  readonly onRetry?: () => void;
  /** Anything inspectable — Error, string, or RTK Query FetchBaseQueryError. */
  readonly technicalDetail?: unknown;
  /** Optional highlighted hint shown above the actions (e.g. a recovery tip). */
  readonly tip?: string;
  /** Optional extra action below the retry button. */
  readonly action?: ReactNode;
  readonly className?: string;
  /** Compact variant for narrow containers (tooltips, sidebars). */
  readonly compact?: boolean;
}

function formatDetail(detail: unknown): string {
  if (detail === null || detail === undefined) return '';
  if (detail instanceof Error) return detail.message;
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'number' || typeof detail === 'boolean') return String(detail);
  try {
    return JSON.stringify(detail, null, 2);
  } catch {
    return '<unrepresentable error>';
  }
}

export function ErrorState({
  title,
  body,
  onRetry,
  technicalDetail,
  tip,
  action,
  className,
  compact = false,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const titleText = title ?? t('states.error.title');
  const bodyText = body ?? t('states.error.body');
  const detail = formatDetail(technicalDetail);

  return (
    <section
      role="alert"
      className={cn(
        'border-border bg-surface mx-auto rounded-lg border shadow-sm',
        compact ? 'max-w-md p-4' : 'max-w-prose p-6',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="bg-error/10 text-error mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={cn('text-ink-primary font-semibold', compact ? 'text-base' : 'text-lg')}>
            {titleText}
          </h2>
          <p className="text-ink-secondary mt-1 text-base">{bodyText}</p>

          {tip ? (
            <p className="bg-subtle text-ink-secondary mt-3 flex items-start gap-2 rounded-md p-3 text-sm">
              <Lightbulb className="text-accent mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{tip}</span>
            </p>
          ) : null}

          {detail ? (
            <details className="text-ink-tertiary mt-3 text-sm">
              <summary className="hover:text-ink-secondary cursor-pointer select-none">
                {t('states.technicalDetail')}
              </summary>
              <pre className="bg-subtle mt-2 max-h-40 overflow-auto rounded-md p-3 font-mono text-xs leading-snug">
                {detail}
              </pre>
            </details>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onRetry ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRetry}
                leadingIcon={<RefreshCcw className="h-3.5 w-3.5" />}
              >
                {t('actions.retry')}
              </Button>
            ) : null}
            {action}
          </div>
        </div>
      </div>
    </section>
  );
}
