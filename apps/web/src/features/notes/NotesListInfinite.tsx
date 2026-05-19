import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ErrorState } from '@/components/molecules/ErrorState';
import { Spinner } from '@/components/atoms/Spinner';
import { NoteCard } from '@/components/organisms/NoteCard';

import { useGetNotesInfiniteQuery } from './notesApi';

export interface NotesListInfiniteProps {
  readonly cityId: string;
  readonly onOpenDetails: (noteId: number) => void;
  readonly onEdit: (noteId: number) => void;
}

export function NotesListInfinite({ cityId, onOpenDetails, onEdit }: NotesListInfiniteProps) {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetNotesInfiniteQuery({ cityId });

  // Intersection observer triggers next-page fetch when the sentinel scrolls
  // into view. Pauses while a fetch is in flight to avoid duplicate requests.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }
      },
      { rootMargin: '120px' },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <Spinner size="lg" label={t('states.loading')} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} technicalDetail={error} />;
  }

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        kind="noData"
        title="No notes yet"
        body="Add the first context note for this city."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((note) => (
        <NoteCard key={note.id} note={note} onOpenDetails={onOpenDetails} onEdit={onEdit} />
      ))}

      {/* Sentinel + fetching indicator */}
      {hasNextPage ? (
        <div ref={sentinelRef} className="flex items-center justify-center py-4">
          {isFetchingNextPage ? <Spinner size="md" label="Loading more" /> : null}
        </div>
      ) : isFetching ? (
        <div className="text-ink-tertiary flex items-center justify-center py-2 text-xs">
          <Spinner size="sm" />
        </div>
      ) : null}
    </div>
  );
}
