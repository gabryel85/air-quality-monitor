import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { Modal, ModalBody, ModalFooter } from '@/components/organisms/Modal';
import { cn } from '@/lib/utils';

import { useCreateNoteMutation } from './notesApi';
import { noteSchema, type NoteFormValues } from './noteSchemas';

export interface NewNoteModalProps {
  readonly cityId: string;
  readonly onClose: () => void;
}

export function NewNoteModal({ cityId, onClose }: NewNoteModalProps) {
  const { t } = useTranslation();
  const [createNote, { isLoading: isSubmitting }] = useCreateNoteMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', content: '' },
    mode: 'onBlur',
  });

  const onValid = async (values: NoteFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await createNote({ cityId, input: values }).unwrap();
      reset();
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
      title={t('actions.newNote')}
      description={cityId}
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

          <FormField label={t('labels.title')} error={errors.title?.message} required>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={isSubmitting}
                {...register('title')}
              />
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
                  'text-md text-ink-primary placeholder:text-ink-tertiary leading-relaxed',
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
