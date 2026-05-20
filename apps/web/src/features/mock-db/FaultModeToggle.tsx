/**
 * FaultModeToggle — desktop header control for the mock fault switch.
 *
 * Compact icon toggle; tinted red while error simulation is on. The mobile
 * header exposes the same switch as a labelled row inside MobileMenu.
 */

import { Bug } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { useFaultMode } from './useFaultMode';

export interface FaultModeToggleProps {
  readonly className?: string;
}

export function FaultModeToggle({ className }: FaultModeToggleProps) {
  const { t } = useTranslation();
  const { enabled, setEnabled } = useFaultMode();

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={t('faultMode.ariaLabel')}
      title={enabled ? t('faultMode.onTitle') : t('faultMode.offTitle')}
      onClick={() => {
        setEnabled(!enabled);
      }}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border',
        'duration-fast transition-colors ease-out',
        'focus-visible:shadow-focus focus-visible:outline-none',
        enabled
          ? 'border-error/40 bg-error/10 text-error'
          : 'border-border bg-surface text-ink-secondary hover:bg-subtle hover:text-ink-primary',
        className,
      )}
    >
      <Bug className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
