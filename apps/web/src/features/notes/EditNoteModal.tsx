import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/atoms/Button';
import { FormField } from '@/components/molecules/FormField';
import { Modal, ModalBody, ModalFooter } from '@/components/organisms/Modal';
import { cn } from '@/lib/utils';

import { useUpdateNoteMutation } from './notesApi';
import { noteContentSchema, type NoteContentValues } from './noteSchemas';
import type { NoteDto } from '@/mocks/types';

export interface EditNoteModalProps {
  readonly cityId: string;
  readonly note: NoteDto;
  readonly onClose: () => void;
}

export function EditNoteModal({ cityId, note, onClose }: EditNoteModalProps) {
  const { t } = useTranslation();
  const [updateNote, { isLoading: isSubmitting }] = useUpdateNoteMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<NoteContentValues>({
    resolver: zodResolver(noteContentSchema),
    defaultValues: { content: note.content },
    mode: 'onBlur',
  });

  useEffect(() => {
    reset({ content: note.content });
  }, [note.id, note.content, reset]);

  const onValid = async (values: NoteContentValues): Promise<void> => {
    setSubmitError(null);
    try {
      await updateNote({ cityId, noteId: note.id, input: values }).unwrap();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('states.error.title'));
    }
  };

  return (
    <Modal
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      hasUnsavedChanges={isDirty}
      title={t('actions.edit')}
      description={note.title}
    >
      <form
        onSubmit={(e) => {
          void handleSubmit(onValid)(e);
        }}
        noValidate
        className="contents"
      >
        <ModalBody className="flex flex-col gap-4">
          {submitError ? <SubmitError message={submitError} /> : null}

          <FormField label={t('labels.title')}>
            {({ id }) => (
              <output
                id={id}
                className={cn(
                  'border-border bg-subtle block w-full rounded-md border px-3 py-2',
                  'text-ink-secondary text-base',
                )}
              >
                {note.title}
              </output>
            )}
          </FormField>

          <FormField label={t('labels.content')} error={errors.content?.message} required>
            {({ id, describedBy, invalid }) => (
              <textarea
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid ? 'true' : undefined}
                disabled={isSubmitting}
                rows={8}
                {...register('content')}
                className={cn(
                  'border-border bg-surface block w-full resize-y rounded-md border px-3 py-2',
                  'text-md text-ink-primary leading-relaxed',
                  'duration-fast transition-colors ease-out',
                  'hover:border-border-strong',
                  'focus:border-border-focus focus:shadow-focus focus:outline-none',
                  'disabled:bg-subtle disabled:cursor-not-allowed disabled:opacity-70',
                  'aria-[invalid=true]:border-error',
                )}
              />
            )}
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {t('actions.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function SubmitError({ message }: { readonly message: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'border-error/30 bg-error/5 flex items-start gap-2 rounded-md border px-3 py-2',
        'text-error text-sm',
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
