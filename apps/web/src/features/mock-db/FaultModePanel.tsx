/**
 * FaultModePanel — the per-endpoint fault selection list.
 *
 * Shared by the desktop header popover and the mobile menu. Each row toggles
 * a simulated 503 on one mock area; the master row flips them all at once.
 */

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Switch } from '@/components/atoms/Switch';
import { cn } from '@/lib/utils';
import { FAULT_TARGETS } from '@/mocks/faultMode';

import { useFaults } from './useFaults';

export interface FaultModePanelProps {
  readonly className?: string;
}

export function FaultModePanel({ className }: FaultModePanelProps) {
  const { t } = useTranslation();
  const { faults, allEnabled, setFault, setAll } = useFaults();
  const baseId = useId();

  return (
    <div className={cn('flex flex-col', className)}>
      <Row
        id={`${baseId}-all`}
        label={t('faultMode.all')}
        emphasis
        checked={allEnabled}
        onChange={setAll}
      />
      <div className="border-border-subtle my-1.5 border-t" />
      {FAULT_TARGETS.map((target) => (
        <Row
          key={target}
          id={`${baseId}-${target}`}
          label={t(`faultMode.targets.${target}`)}
          checked={faults.has(target)}
          onChange={(on) => {
            setFault(target, on);
          }}
        />
      ))}
    </div>
  );
}

function Row({
  id,
  label,
  checked,
  onChange,
  emphasis = false,
}: {
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (next: boolean) => void;
  readonly emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span
        id={id}
        className={cn(
          'text-sm',
          emphasis ? 'text-ink-primary font-semibold' : 'text-ink-secondary',
        )}
      >
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} tone="error" aria-labelledby={id} />
    </div>
  );
}
