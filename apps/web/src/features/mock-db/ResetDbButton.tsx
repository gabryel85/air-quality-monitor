/**
 * ResetDbButton — header control that resets the mock notes database.
 *
 * Resetting is destructive (it deletes the user's own notes), so the click
 * opens a Radix Popover confirmation rather than acting immediately. On
 * success the panel shows a brief confirmation and closes itself.
 */

import * as Popover from '@radix-ui/react-popover';
import { Check, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

import { useResetDb } from './useResetDb';

export interface ResetDbButtonProps {
  readonly className?: string;
}

export function ResetDbButton({ className }: ResetDbButtonProps) {
  const { t } = useTranslation();
  const { status, reset } = useResetDb();
  const [open, setOpen] = useState(false);

  // Auto-dismiss shortly after a successful reset.
  useEffect(() => {
    if (status !== 'done' || !open) return;
    const id = setTimeout(() => setOpen(false), 1500);
    return () => {
      clearTimeout(id);
    };
  }, [status, open]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={t('mockDb.ariaLabel')}
        title={t('mockDb.ariaLabel')}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md',
          'border-border bg-surface text-ink-secondary border',
          'duration-fast transition-colors ease-out',
          'hover:bg-subtle hover:text-ink-primary',
          'focus-visible:shadow-focus focus-visible:outline-none',
          'data-[state=open]:border-border-strong data-[state=open]:text-ink-primary',
          className,
        )}
      >
        <Database className="h-4 w-4" aria-hidden="true" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 w-72 rounded-lg border p-4',
            'border-border bg-surface shadow-lg',
            'data-[state=open]:animate-slide-up-fade',
          )}
        >
          {status === 'done' ? (
            <p className="text-ink-primary flex items-center gap-2.5 text-base font-medium">
              <span className="bg-success/10 text-success inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              {t('mockDb.resetDone')}
            </p>
          ) : (
            <>
              <p className="text-ink-primary text-base font-semibold">{t('mockDb.resetTitle')}</p>
              <p className="text-ink-secondary mt-1 text-sm leading-snug">
                {t('mockDb.resetBody')}
              </p>
              {status === 'error' ? (
                <p className="text-error mt-2 text-sm">{t('mockDb.resetError')}</p>
              ) : null}
              <div className="mt-3.5 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  {t('actions.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  loading={status === 'resetting'}
                  onClick={() => void reset()}
                >
                  {t('mockDb.reset')}
                </Button>
              </div>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
