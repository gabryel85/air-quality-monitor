/**
 * NoteModal trio + router — feature-organism.
 *
 * URL-driven modal mounting. The router reads `?modal` and `?noteId` from the
 * URL and conditionally mounts one of three modals:
 *
 *   ?modal=new                       → NewNoteModal
 *   ?modal=details&noteId=42         → NoteDetailsModal
 *   ?modal=edit&noteId=42            → EditNoteModal
 *
 * Each modal closes by clearing `modal` and `noteId` from the URL — back-button-
 * friendly, deep-linkable, refresh-safe.
 *
 * Stack on display: shadcn/Radix Dialog (focus trap, ESC, ARIA) + react-hook-form
 * (uncontrolled inputs, zero re-render on keystroke) + zod (single source of
 * truth for validation, schema can be reused on the server).
 */

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from './Button';
import { cn, type Note } from './types';

// ============================================================
// Validation schema (reused by NewNoteModal + EditNoteModal)
// ============================================================

const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be at most 120 characters'),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(5000, 'Content must be at most 5000 characters'),
});

type NoteFormValues = z.infer<typeof noteSchema>;

// ============================================================
// URL-driven router
// ============================================================

type SearchParamsLike = {
  get: (key: string) => string | null;
};

export interface NoteModalRouterProps {
  readonly cityId: string;
  /** Pass `useSearchParams()[0]` from react-router (typed minimally for portability). */
  readonly searchParams: SearchParamsLike;
  /** Called to close any open modal: clears `modal` and `noteId` from URL. */
  readonly onClose: () => void;
  /** Pre-fetched note for details/edit (typically from RTK Query). */
  readonly note?: Note;
  /** Mutations injected — keeps this component framework-agnostic. */
  readonly onCreate: (values: NoteFormValues) => Promise<void>;
  readonly onUpdate: (noteId: number, content: string) => Promise<void>;
}

export function NoteModalRouter({
  cityId,
  searchParams,
  onClose,
  note,
  onCreate,
  onUpdate,
}: NoteModalRouterProps) {
  const modal = searchParams.get('modal');
  const noteIdParam = searchParams.get('noteId');
  const noteId = noteIdParam ? Number(noteIdParam) : undefined;

  if (modal === 'new') {
    return <NewNoteModal cityId={cityId} onSubmit={onCreate} onClose={onClose} />;
  }

  if (modal === 'details' && note && noteId === note.id) {
    return <NoteDetailsModal note={note} onClose={onClose} />;
  }

  if (modal === 'edit' && note && noteId === note.id) {
    return (
      <EditNoteModal
        note={note}
        onSubmit={async (content) => onUpdate(note.id, content)}
        onClose={onClose}
      />
    );
  }

  return null;
}

// ============================================================
// Shared modal chrome
// ============================================================

function ModalShell({
  title,
  description,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-overlay',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-[540px]',
            '-translate-x-1/2 -translate-y-1/2',
            'sm:rounded-xl',
            'bg-surface text-ink-primary shadow-xl',
            'data-[state=open]:animate-slide-up-fade',
            // Mobile full-screen sheet
            'max-sm:inset-0 max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none',
            'flex flex-col max-h-[90vh] max-sm:max-h-none max-sm:h-full',
          )}
        >
          <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div>
              <Dialog.Title className="text-lg font-semibold leading-tight text-ink-primary">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-base text-ink-secondary">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className={cn(
                  '-mr-2 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md',
                  'text-ink-tertiary hover:text-ink-primary hover:bg-subtle',
                  'focus-visible:outline-none focus-visible:shadow-focus',
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

function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-md border border-error/30 bg-error/5 px-3 py-2',
        'text-sm text-error',
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

// ============================================================
// 1. NewNoteModal
// ============================================================

function NewNoteModal({
  cityId,
  onSubmit,
  onClose,
}: {
  cityId: string;
  onSubmit: (values: NoteFormValues) => Promise<void>;
  onClose: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', content: '' },
    mode: 'onBlur',
  });

  const handleClose = (next: boolean) => {
    if (next) return;
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    reset();
    onClose();
  };

  const onValid = async (values: NoteFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save note. Try again.');
    }
  };

  return (
    <ModalShell
      open
      onOpenChange={handleClose}
      title="New note"
      description={`Add context for ${cityId}.`}
    >
      <form
        onSubmit={handleSubmit(onValid)}
        className="flex flex-col gap-4 px-6 pb-6 overflow-y-auto"
        noValidate
      >
        <FormError message={submitError} />

        <Field label="Title" htmlFor="note-title" error={errors.title?.message}>
          <input
            id="note-title"
            type="text"
            autoComplete="off"
            aria-invalid={errors.title ? 'true' : undefined}
            aria-describedby={errors.title ? 'note-title-error' : undefined}
            disabled={isSubmitting}
            className={inputClass}
            {...register('title')}
          />
        </Field>

        <Field label="Content" htmlFor="note-content" error={errors.content?.message}>
          <textarea
            id="note-content"
            rows={8}
            aria-invalid={errors.content ? 'true' : undefined}
            aria-describedby={errors.content ? 'note-content-error' : undefined}
            disabled={isSubmitting}
            className={cn(inputClass, 'resize-y min-h-[160px] leading-relaxed text-md')}
            {...register('content')}
          />
        </Field>

        <footer className="flex items-center justify-end gap-2 pt-2">
          <Dialog.Close asChild>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Save
          </Button>
        </footer>
      </form>
    </ModalShell>
  );
}

// ============================================================
// 2. NoteDetailsModal
// ============================================================

function NoteDetailsModal({ note, onClose }: { note: Note; onClose: () => void }) {
  return (
    <ModalShell
      open
      onOpenChange={(next) => !next && onClose()}
      title={note.title}
    >
      <div className="flex flex-col gap-4 px-6 pb-6 overflow-y-auto">
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-secondary">
          <div className="inline-flex gap-1.5">
            <dt className="font-medium">Created</dt>
            <dd>
              <time dateTime={note.createdAt}>{formatDate(note.createdAt)}</time>
            </dd>
          </div>
          <div className="inline-flex gap-1.5">
            <dt className="font-medium">Updated</dt>
            <dd>
              <time dateTime={note.updatedAt}>{formatDate(note.updatedAt)}</time>
            </dd>
          </div>
        </dl>

        <div className="rounded-md border border-border-subtle bg-subtle/50 p-4">
          <p className="whitespace-pre-wrap text-md leading-relaxed text-ink-primary">
            {note.content}
          </p>
        </div>

        <footer className="flex items-center justify-end pt-2">
          <Dialog.Close asChild>
            <Button variant="secondary" type="button">
              Close
            </Button>
          </Dialog.Close>
        </footer>
      </div>
    </ModalShell>
  );
}

// ============================================================
// 3. EditNoteModal — only content is editable; title is read-only by spec
// ============================================================

function EditNoteModal({
  note,
  onSubmit,
  onClose,
}: {
  note: Note;
  onSubmit: (content: string) => Promise<void>;
  onClose: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const editSchema = noteSchema.pick({ content: true });
  type EditValues = z.infer<typeof editSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { content: note.content },
    mode: 'onBlur',
  });

  // If the note prop changes (cache update), reset the form to the new content.
  useEffect(() => {
    reset({ content: note.content });
  }, [note.id, note.content, reset]);

  const handleClose = (next: boolean) => {
    if (next) return;
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    onClose();
  };

  const onValid = async (values: EditValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values.content);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save changes. Try again.');
    }
  };

  return (
    <ModalShell
      open
      onOpenChange={handleClose}
      title="Edit note"
      description="Only the content can be edited."
    >
      <form
        onSubmit={handleSubmit(onValid)}
        className="flex flex-col gap-4 px-6 pb-6 overflow-y-auto"
        noValidate
      >
        <FormError message={submitError} />

        <Field label="Title" htmlFor="edit-title">
          <output
            id="edit-title"
            className={cn(inputClass, 'cursor-not-allowed bg-subtle text-ink-secondary')}
          >
            {note.title}
          </output>
        </Field>

        <Field label="Content" htmlFor="edit-content" error={errors.content?.message}>
          <textarea
            id="edit-content"
            rows={8}
            aria-invalid={errors.content ? 'true' : undefined}
            aria-describedby={errors.content ? 'edit-content-error' : undefined}
            disabled={isSubmitting}
            className={cn(inputClass, 'resize-y min-h-[160px] leading-relaxed text-md')}
            {...register('content')}
          />
        </Field>

        <footer className="flex items-center justify-end gap-2 pt-2">
          <Dialog.Close asChild>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Dialog.Close>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Save
          </Button>
        </footer>
      </form>
    </ModalShell>
  );
}

// ============================================================
// Helpers
// ============================================================

const inputClass = cn(
  'block w-full rounded-md border border-border bg-surface px-3 py-2',
  'text-base text-ink-primary placeholder:text-ink-tertiary',
  'transition-colors duration-fast ease-out',
  'hover:border-border-strong',
  'focus:outline-none focus:border-border-focus focus:shadow-focus',
  'disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-70',
  'aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_3px_rgba(197,48,48,0.20)]',
);

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-primary">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ============================================================
 * Aesthetic & engineering notes
 * ============================================================
 * - Modal chrome lives in `ModalShell`; three variants share it. DRY without
 *   abstracting away the differences that matter (each variant has its own
 *   form/content semantics).
 * - URL-driven router is the public surface (`NoteModalRouter`). Internal
 *   modals are not exported — encourages routing via URL, not by lifting
 *   modal state into parents.
 * - Mobile = full-screen sheet via `max-sm:` utility variants. No JS, just
 *   CSS responsive classes.
 * - Form state is uncontrolled (`register` from react-hook-form) — zero
 *   re-renders on keystroke, native input behavior preserved.
 * - Zod schema is the single source of truth. Same schema would validate
 *   MSW handler payloads (drop into `mocks/handlers.ts` for honesty).
 * - Pessimistic flow visible: `isSubmitting` disables form + shows spinner
 *   on Save; on error the form values stay intact and an inline alert
 *   appears at the top.
 * - `<output>` for read-only title in EditNote is semantically richer than
 *   a `<div>` styled like an input.
 * - Native `confirm()` for discard-changes — pragmatic. In implementation,
 *   swap for an in-app AlertDialog if branding matters there too.
 */
