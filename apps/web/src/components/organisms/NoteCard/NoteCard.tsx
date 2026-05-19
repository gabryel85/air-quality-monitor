/**
 * NoteCard — organism.
 *
 * Uses the "stretched button" a11y pattern: the entire card surface opens
 * Details, but the actual interactive element is a real <button> overlaid
 * at z-0 with sr-only label text. Visible action buttons (Details/Edit)
 * sit at z-10 so clicks hit them first; no nested-button problem.
 *
 * Result: 1 keyboard tab stop for the whole card-as-primary-action,
 * plus 2 separate stops for the per-action buttons. Card itself is a
 * semantic <article> with no interactive role, satisfying jsx-a11y.
 */

import { Eye, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/atoms/Button';
import { formatRelativeTime } from '@/lib/relativeTime';
import { cn } from '@/lib/utils';

export interface NoteCardData {
  readonly id: number;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface NoteCardProps {
  readonly note: NoteCardData;
  readonly onOpenDetails: (noteId: number) => void;
  readonly onEdit: (noteId: number) => void;
  readonly className?: string;
}

export function NoteCard({ note, onOpenDetails, onEdit, className }: NoteCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'en';

  const created = new Date(note.createdAt);
  const updated = new Date(note.updatedAt);
  const wasEdited = updated.getTime() !== created.getTime();

  return (
    <article
      className={cn(
        'border-border-subtle bg-surface group relative flex flex-col gap-2 rounded-lg border p-4',
        'duration-fast transition-[border-color,background-color,box-shadow] ease-out',
        'hover:border-border-strong hover:bg-subtle/40 hover:shadow-sm',
        'focus-within:border-border-strong',
        className,
      )}
    >
      {/* Stretched primary-action button: fills the card, lives BELOW
          the explicit action buttons in z-order. SR label keeps it
          accessible. */}
      <button
        type="button"
        onClick={() => {
          onOpenDetails(note.id);
        }}
        className={cn(
          'absolute inset-0 z-0 rounded-lg',
          'focus-visible:shadow-focus focus-visible:outline-none',
        )}
      >
        <span className="sr-only">
          {t('actions.details')} — {note.title}
        </span>
      </button>

      <header className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
        <h3
          className="text-ink-primary min-w-0 flex-1 truncate text-base font-semibold"
          title={note.title}
        >
          {note.title}
        </h3>
        <div className="pointer-events-auto flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              onOpenDetails(note.id);
            }}
            aria-label={`${t('actions.details')} — ${note.title}`}
          >
            {t('actions.details')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => {
              onEdit(note.id);
            }}
            aria-label={`${t('actions.edit')} — ${note.title}`}
          >
            {t('actions.edit')}
          </Button>
        </div>
      </header>

      <dl className="text-ink-secondary pointer-events-none relative z-10 flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
        <div className="inline-flex gap-1">
          <dt className="text-ink-tertiary">{t('labels.created')}</dt>
          <dd>
            <time dateTime={note.createdAt}>{formatRelativeTime(created.getTime(), locale)}</time>
          </dd>
        </div>
        {wasEdited ? (
          <div className="inline-flex gap-1">
            <dt className="text-ink-tertiary">{t('labels.updated')}</dt>
            <dd>
              <time dateTime={note.updatedAt}>{formatRelativeTime(updated.getTime(), locale)}</time>
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
