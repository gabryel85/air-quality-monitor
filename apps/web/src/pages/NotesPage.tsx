import { useParams } from 'react-router-dom';

export function NotesPage() {
  const { cityId = '' } = useParams<{ cityId: string }>();

  return (
    <section aria-labelledby="notes-title" className="py-8">
      <h1 id="notes-title" className="text-ink-primary text-2xl font-semibold tracking-tight">
        Notes for <span className="font-mono">{cityId || '—'}</span>
      </h1>
      <div className="border-border bg-subtle/50 mt-8 rounded-lg border border-dashed p-12 text-center">
        <p className="text-ink-secondary">
          NotesList + NoteModal land here in features/notes during Phase 5.
        </p>
      </div>
    </section>
  );
}
