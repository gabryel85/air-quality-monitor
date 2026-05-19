import { useTranslation } from 'react-i18next';

import { Button } from '@/components/atoms/Button';
import { Modal, ModalBody, ModalFooter } from '@/components/organisms/Modal';
import { formatRelativeTime } from '@/lib/relativeTime';
import type { NoteDto } from '@/mocks/types';

export interface NoteDetailsModalProps {
  readonly note: NoteDto;
  readonly onClose: () => void;
}

export function NoteDetailsModal({ note, onClose }: NoteDetailsModalProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'en';

  return (
    <Modal
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={note.title}
    >
      <ModalBody className="flex flex-col gap-4">
        <dl className="text-ink-secondary flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div className="inline-flex gap-1.5">
            <dt className="font-medium">{t('labels.created')}</dt>
            <dd>
              <time dateTime={note.createdAt}>
                {formatRelativeTime(new Date(note.createdAt).getTime(), locale)}
              </time>
            </dd>
          </div>
          <div className="inline-flex gap-1.5">
            <dt className="font-medium">{t('labels.updated')}</dt>
            <dd>
              <time dateTime={note.updatedAt}>
                {formatRelativeTime(new Date(note.updatedAt).getTime(), locale)}
              </time>
            </dd>
          </div>
        </dl>

        <div className="border-border-subtle bg-subtle/50 rounded-md border p-4">
          <p className="text-md text-ink-primary whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" type="button" onClick={onClose}>
          {t('actions.close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
