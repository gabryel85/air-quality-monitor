/**
 * EmptyState — molecule.
 *
 * Three semantic kinds, each with its own icon and i18n keys. Caller can
 * override copy via props for one-off cases (rare — most usage is via kind).
 *
 *   <EmptyState kind="noSelection" />
 *   <EmptyState kind="noData" />
 *   <EmptyState kind="noFilterResults" onClearFilter={() => …} />
 */

import { Compass, Database, FilterX, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

export type EmptyStateKind = 'noSelection' | 'noData' | 'noFilterResults';

const ICONS: Record<EmptyStateKind, LucideIcon> = {
  noSelection: Compass,
  noData: Database,
  noFilterResults: FilterX,
};

export interface EmptyStateProps {
  readonly kind: EmptyStateKind;
  /** Override default i18n title. */
  readonly title?: string;
  /** Override default i18n body. */
  readonly body?: string;
  /** Called when 'Clear filter' CTA pressed — only renders for `noFilterResults`. */
  readonly onClearFilter?: () => void;
  /** Optional extra action below the default CTA. */
  readonly action?: ReactNode;
  readonly className?: string;
}

export function EmptyState({
  kind,
  title,
  body,
  onClearFilter,
  action,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation();
  const Icon = ICONS[kind];

  const titleText = title ?? t(`states.${kind}.title`);
  const bodyText = body ?? t(`states.${kind}.body`);

  return (
    <div
      role="status"
      className={cn(
        'mx-auto flex max-w-prose flex-col items-center justify-center gap-2 px-4 py-16 text-center',
        className,
      )}
    >
      <span className="bg-subtle text-ink-tertiary inline-flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-ink-primary mt-3 text-lg font-semibold">{titleText}</h2>
      <p className="text-ink-secondary max-w-prose text-base">{bodyText}</p>

      {kind === 'noFilterResults' && onClearFilter ? (
        <Button variant="secondary" size="sm" onClick={onClearFilter} className="mt-2">
          {t('actions.clearFilter')}
        </Button>
      ) : null}

      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
