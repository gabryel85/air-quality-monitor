/**
 * FaultModeToggle — desktop header control for the mock fault switches.
 *
 * The bug icon opens a popover where individual mock endpoints can be set to
 * fail; the icon is tinted red while any fault is active. The mobile header
 * exposes the same chooser as a section inside MobileMenu.
 */

import * as Popover from '@radix-ui/react-popover';
import { Bug } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { FaultModePanel } from './FaultModePanel';
import { useFaults } from './useFaults';

export interface FaultModeToggleProps {
  readonly className?: string;
}

export function FaultModeToggle({ className }: FaultModeToggleProps) {
  const { t } = useTranslation();
  const { anyEnabled } = useFaults();
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={t('faultMode.ariaLabel')}
        title={t('faultMode.label')}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md border',
          'duration-fast transition-colors ease-out',
          'focus-visible:shadow-focus focus-visible:outline-none',
          anyEnabled
            ? 'border-error/40 bg-error/10 text-error'
            : 'border-border bg-surface text-ink-secondary hover:bg-subtle hover:text-ink-primary data-[state=open]:border-border-strong',
          className,
        )}
      >
        <Bug className="h-4 w-4" aria-hidden="true" />
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
          <p className="text-ink-primary text-base font-semibold">{t('faultMode.label')}</p>
          <p className="text-ink-secondary mt-1 text-sm leading-snug">
            {t('faultMode.description')}
          </p>
          <FaultModePanel className="mt-3" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
