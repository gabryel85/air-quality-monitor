import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type KbdProps = HTMLAttributes<HTMLElement>;

/**
 * Keyboard shortcut display. Use for `<Kbd>Esc</Kbd>`, `<Kbd>↵</Kbd>` etc.
 * Sized for inline placement next to body text.
 */
export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd
      className={cn(
        'border-border-subtle inline-flex h-5 items-center rounded border',
        'bg-subtle text-ink-secondary px-1.5 font-mono text-xs font-medium',
        'shadow-xs',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}
