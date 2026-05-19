import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EditNoteModal } from './EditNoteModal';
import { NewNoteModal } from './NewNoteModal';
import { NoteDetailsModal } from './NoteDetailsModal';
import { useGetNoteQuery } from './notesApi';

export interface NoteModalRouterProps {
  readonly cityId: string;
}

export function NoteModalRouter({ cityId }: NoteModalRouterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const modal = searchParams.get('modal');
  const noteIdRaw = searchParams.get('noteId');
  const noteId = noteIdRaw !== null ? Number(noteIdRaw) : null;

  const close = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('modal');
    next.delete('noteId');
    setSearchParams(next, { replace: false });
  }, [searchParams, setSearchParams]);

  if (modal === 'new') {
    return <NewNoteModal cityId={cityId} onClose={close} />;
  }

  if ((modal === 'details' || modal === 'edit') && noteId !== null && Number.isFinite(noteId)) {
    return <NoteModalWithFetch cityId={cityId} noteId={noteId} mode={modal} onClose={close} />;
  }

  return null;
}

interface NoteModalWithFetchProps {
  readonly cityId: string;
  readonly noteId: number;
  readonly mode: 'details' | 'edit';
  readonly onClose: () => void;
}

function NoteModalWithFetch({ cityId, noteId, mode, onClose }: NoteModalWithFetchProps) {
  const { data: note, isLoading, isError } = useGetNoteQuery({ cityId, noteId });

  if (isLoading || isError || !note) {
    // While the note loads, render nothing — the route can stay; the modal
    // simply appears once data resolves. Could swap for a spinner overlay.
    return null;
  }

  if (mode === 'edit') return <EditNoteModal cityId={cityId} note={note} onClose={onClose} />;
  return <NoteDetailsModal note={note} onClose={onClose} />;
}
