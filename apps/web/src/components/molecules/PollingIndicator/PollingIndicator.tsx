/**
 * PollingIndicator — molecule.
 *
 * Communicates the freshness of the dashboard data:
 *   - Live: pulsing dot + "Live · updated 12s ago"
 *   - Error: red dot + "Refresh failed" + retry button
 *
 * Renders aria-live="polite" so screen readers learn about freshness
 * without being interrupted mid-task.
 *
 * `lastUpdatedAt`: epoch ms of the most recent successful fetch. Component
 * re-renders every `refreshIntervalMs` to advance the relative time
 * (default 5 s — keeps "updated 7s ago" responsive without flooding RAF).
 */

import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/relativeTime';

export interface PollingIndicatorProps {
  readonly lastUpdatedAt: number | null;
  readonly isError?: boolean;
  readonly onRetry?: () => void;
  readonly className?: string;
  /** Re-render cadence for relative time display (ms). Default 5000. */
  readonly refreshIntervalMs?: number;
}

export function PollingIndicator({
  lastUpdatedAt,
  isError = false,
  onRetry,
  className,
  refreshIntervalMs = 5_000,
}: PollingIndicatorProps) {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), refreshIntervalMs);
    return () => {
      window.clearInterval(id);
    };
  }, [refreshIntervalMs]);

  const locale = i18n.resolvedLanguage ?? 'en';
  const relative = lastUpdatedAt ? formatRelativeTime(lastUpdatedAt, locale, now) : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 text-sm',
        isError ? 'text-error' : 'text-ink-secondary',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          isError ? 'bg-error' : 'animate-poll-pulse bg-sensor-online motion-reduce:animate-none',
        )}
      />
      {isError ? (
        <>
          <span className="font-medium">{t('states.error.title')}</span>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              aria-label={t('actions.retry')}
              className={cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-md',
                'text-error hover:bg-error/10',
                'focus-visible:shadow-focus focus-visible:outline-none',
              )}
            >
              <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </>
      ) : (
        <>
          <span className="text-ink-primary font-medium">{t('labels.live')}</span>
          {relative ? (
            <span className="text-ink-tertiary">
              · {t('labels.updatedAgo', { value: relative })}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
