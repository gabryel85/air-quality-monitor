import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { ErrorState } from '@/components/molecules/ErrorState';
import { Modal, ModalBody, ModalFooter } from '@/components/organisms/Modal';

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
  const { t } = useTranslation();
  const { data: note, isLoading, isError, error, refetch } = useGetNoteQuery({ cityId, noteId });

  if (isLoading) {
    return (
      <Modal
        open
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
        title={mode === 'edit' ? t('actions.edit') : t('actions.details')}
      >
        <ModalBody>
          <div className="flex min-h-40 items-center justify-center">
            <Spinner size="lg" label={t('states.loading')} />
          </div>
        </ModalBody>
      </Modal>
    );
  }

  if (isError || !note) {
    return (
      <Modal
        open
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
        title={mode === 'edit' ? t('actions.edit') : t('actions.details')}
      >
        <ModalBody>
          <ErrorState compact onRetry={() => void refetch()} technicalDetail={error} />
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t('actions.close')}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  if (mode === 'edit') return <EditNoteModal cityId={cityId} note={note} onClose={onClose} />;
  return <NoteDetailsModal note={note} onClose={onClose} />;
}
