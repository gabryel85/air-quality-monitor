import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { ErrorState } from '@/components/molecules/ErrorState';
import { useGetCityQuery } from '@/features/cities/citiesApi';
import { CityTrendChart } from '@/features/cities/CityTrendChart';
import { NoteModalRouter } from '@/features/notes/NoteModalRouter';
import { NotesListInfinite } from '@/features/notes/NotesListInfinite';
import { cn } from '@/lib/utils';

export function NotesPage() {
  const { t } = useTranslation();
  const { cityId = '' } = useParams<{ cityId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const { data: city, isError, error, refetch } = useGetCityQuery(cityId, { skip: !cityId });

  const openModal = useCallback(
    (modal: 'new' | 'details' | 'edit', noteId?: number) => {
      const next = new URLSearchParams(searchParams);
      next.set('modal', modal);
      if (noteId !== undefined) next.set('noteId', String(noteId));
      else next.delete('noteId');
      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams],
  );

  const handleOpenDetails = useCallback(
    (noteId: number) => openModal('details', noteId),
    [openModal],
  );
  const handleEdit = useCallback((noteId: number) => openModal('edit', noteId), [openModal]);
  const handleNew = useCallback(() => openModal('new'), [openModal]);

  if (!cityId) {
    return <ErrorState title={t('states.invalidCity.title')} body={t('states.invalidCity.body')} />;
  }

  return (
    <section aria-labelledby="notes-title" className="flex flex-col gap-6 py-6">
      <header className="flex flex-col gap-3">
        <Link
          to={{ pathname: '/dashboard', search: location.search }}
          className={cn(
            'text-ink-secondary inline-flex w-fit items-center gap-1 text-sm',
            'hover:text-ink-primary',
            'focus-visible:shadow-focus rounded-md focus-visible:outline-none',
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t('app.title')}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="notes-title" className="text-ink-primary text-2xl font-semibold tracking-tight">
            {city?.city ?? cityId}
          </h1>
          <Button
            variant="primary"
            size="md"
            leadingIcon={<Plus className="h-4 w-4" />}
            onClick={handleNew}
          >
            {t('actions.newNote')}
          </Button>
        </div>
      </header>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} technicalDetail={error} />
      ) : (
        <>
          {/* Pollutant trend for this city — sits above the notes per spec
              extension; this is where the 24h range is genuinely live. */}
          <CityTrendChart cityId={cityId} />
          <NotesListInfinite
            cityId={cityId}
            onOpenDetails={handleOpenDetails}
            onEdit={handleEdit}
          />
        </>
      )}

      <NoteModalRouter cityId={cityId} />
    </section>
  );
}
