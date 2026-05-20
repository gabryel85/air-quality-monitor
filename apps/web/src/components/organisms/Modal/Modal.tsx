/**
 * Modal — organism.
 *
 * Token-styled wrapper around Radix Dialog. Radix provides:
 *   - Focus trap
 *   - ESC to close
 *   - Click-outside to close
 *   - role="dialog" + aria-modal="true"
 *   - aria-labelledby pointing at the title
 *   - Body scroll lock
 *
 * Custom on top:
 *   - Mobile full-screen sheet (max-sm: variants)
 *   - Slide-up-fade entrance
 *   - Optional onDirtyClose confirm-before-close
 *   - Header with title/description + close button slot
 *
 * Open/close is controlled by the caller — the caller owns whether the modal
 * is mounted. URL-driven mounting is wired in features/notes (NoteModalRouter).
 */

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'sm:max-w-[420px]',
  md: 'sm:max-w-[540px]',
  lg: 'sm:max-w-[720px]',
};

export interface ModalProps {
  readonly open: boolean;
  readonly onOpenChange: (next: boolean) => void;
  /** If the form/content has unsaved changes, asks the user before closing. */
  readonly hasUnsavedChanges?: boolean;
  readonly title: string;
  readonly description?: string;
  readonly size?: ModalSize;
  readonly className?: string;
  readonly children: ReactNode;
}

export function Modal({
  open,
  onOpenChange,
  hasUnsavedChanges = false,
  title,
  description,
  size = 'md',
  className,
  children,
}: ModalProps) {
  const { t } = useTranslation();

  function handleOpenChange(next: boolean): void {
    if (!next && hasUnsavedChanges) {
      const confirmed = window.confirm('Discard unsaved changes?');
      if (!confirmed) return;
    }
    onOpenChange(next);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'bg-overlay fixed inset-0 z-40 backdrop-blur-sm',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
            'flex max-h-[90vh] flex-col',
            'bg-surface text-ink-primary shadow-xl sm:rounded-xl',
            // Mobile sheet has no centering transform → a plain fade is safe.
            // Desktop is centered → modal-in keeps translate(-50%,-50%).
            'data-[state=open]:animate-fade-in sm:data-[state=open]:animate-modal-in',
            /* Mobile full-screen sheet */
            'max-sm:inset-0 max-sm:h-full max-sm:max-h-none max-sm:max-w-none',
            'max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none',
            SIZE_CLASS[size],
            className,
          )}
        >
          <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
            <div className="min-w-0">
              <Dialog.Title className="text-ink-primary text-lg font-semibold leading-tight">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="text-ink-secondary mt-1 text-base">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('actions.close')}
                className={cn(
                  '-mr-2 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                  'text-ink-tertiary hover:bg-subtle hover:text-ink-primary',
                  'focus-visible:shadow-focus focus-visible:outline-none',
                )}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </header>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Optional helper for the content area below the header. Adds standard
 * horizontal padding and scrollable overflow for long bodies.
 */
export function ModalBody({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return <div className={cn('flex-1 overflow-y-auto px-6 pb-6', className)}>{children}</div>;
}

/**
 * Footer area for primary/secondary actions. Right-aligned on desktop.
 */
export function ModalFooter({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <footer
      className={cn(
        'border-border-subtle bg-subtle/40 flex items-center justify-end gap-2 border-t px-6 py-3',
        className,
      )}
    >
      {children}
    </footer>
  );
}
