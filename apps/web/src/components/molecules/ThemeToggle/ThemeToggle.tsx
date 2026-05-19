import { Monitor, Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ThemePreference } from '@/features/theme/types';
import { useTheme } from '@/features/theme/useTheme';

const ICONS: Record<ThemePreference, typeof Sun> = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
};

const LABELS: Record<ThemePreference, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  auto: 'Auto (system)',
};

export interface ThemeToggleProps {
  readonly className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { preference, cyclePreference } = useTheme();
  const Icon = ICONS[preference];

  return (
    <button
      type="button"
      onClick={cyclePreference}
      aria-label={`Theme: ${LABELS[preference]}. Click to cycle.`}
      title={LABELS[preference]}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md',
        'border-border bg-surface text-ink-secondary border',
        'duration-fast transition-colors ease-out',
        'hover:bg-subtle hover:text-ink-primary',
        'focus-visible:shadow-focus focus-visible:outline-none',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
