/**
 * Switch — atom.
 *
 * Accessible on/off toggle (`role="switch"`). Pair with a visible label via
 * `aria-labelledby`, or pass `aria-label` when used standalone.
 */

import { cn } from '@/lib/utils';

export type SwitchTone = 'accent' | 'error';

export interface SwitchProps {
  readonly checked: boolean;
  readonly onCheckedChange: (next: boolean) => void;
  readonly disabled?: boolean;
  /** Track colour when on. `error` signals a deliberately disruptive state. */
  readonly tone?: SwitchTone;
  readonly id?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'aria-describedby'?: string;
  readonly className?: string;
}

const TONE_ON: Record<SwitchTone, string> = {
  accent: 'bg-accent',
  error: 'bg-error',
};

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  tone = 'accent',
  id,
  className,
  ...aria
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        onCheckedChange(!checked);
      }}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full',
        'duration-fast transition-colors ease-out',
        'focus-visible:shadow-focus focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? TONE_ON[tone] : 'bg-muted',
        className,
      )}
      {...aria}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-sm',
          'duration-fast transition-transform ease-out',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
