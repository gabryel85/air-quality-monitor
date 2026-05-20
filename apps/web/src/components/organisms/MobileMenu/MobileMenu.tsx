/**
 * MobileMenu — organism.
 *
 * Hamburger control shown below the `sm` breakpoint. Opens a right-side sheet
 * (Radix Dialog — focus trap, ESC, scroll lock) that gathers the controls
 * sitting inline in the desktop header: data freshness, theme, language, and
 * the mock-data reset.
 */

import * as Dialog from '@radix-ui/react-dialog';
import { Check, Menu, Monitor, Moon, RotateCcw, Sun, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/atoms/Button';
import { Switch } from '@/components/atoms/Switch';
import { PollingIndicator } from '@/components/molecules/PollingIndicator';
import { useFaultMode } from '@/features/mock-db/useFaultMode';
import { useResetDb } from '@/features/mock-db/useResetDb';
import type { ThemePreference } from '@/features/theme/types';
import { useTheme } from '@/features/theme/useTheme';
import { isSupportedLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

export interface MobileMenuProps {
  readonly hasSelection: boolean;
  readonly lastUpdatedAt: number | null;
  readonly isHistorical: boolean;
  readonly isError: boolean;
  readonly className?: string;
}

/** Languages are always labelled in their own name, never translated. */
const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  pl: 'Polski',
  en: 'English',
};

interface Segment<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon?: ReactNode;
}

function Segmented<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
}: {
  readonly ariaLabel: string;
  readonly options: ReadonlyArray<Segment<T>>;
  readonly value: T;
  readonly onChange: (next: T) => void;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="bg-subtle flex gap-1 rounded-lg p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => {
              onChange(option.value);
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm',
              'duration-fast transition-colors ease-out',
              'focus-visible:shadow-focus focus-visible:outline-none',
              active
                ? 'bg-surface text-ink-primary font-semibold shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary',
            )}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-ink-tertiary text-xs font-semibold uppercase tracking-wide">{title}</h3>
      {children}
    </section>
  );
}

export function MobileMenu({
  hasSelection,
  lastUpdatedAt,
  isHistorical,
  isError,
  className,
}: MobileMenuProps) {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useTheme();
  const { status: resetStatus, reset } = useResetDb();
  const { enabled: faultEnabled, setEnabled: setFaultEnabled } = useFaultMode();
  const [open, setOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const language: SupportedLanguage = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : 'pl';

  const themeOptions: ReadonlyArray<Segment<ThemePreference>> = [
    {
      value: 'light',
      label: t('theme.light'),
      icon: <Sun className="h-4 w-4" aria-hidden="true" />,
    },
    {
      value: 'dark',
      label: t('theme.dark'),
      icon: <Moon className="h-4 w-4" aria-hidden="true" />,
    },
    {
      value: 'auto',
      label: t('theme.auto'),
      icon: <Monitor className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  const languageOptions: ReadonlyArray<Segment<SupportedLanguage>> = SUPPORTED_LANGUAGES.map(
    (lng) => ({ value: lng, label: LANGUAGE_LABELS[lng] }),
  );

  function handleOpenChange(next: boolean): void {
    setOpen(next);
    if (!next) setConfirmingReset(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        aria-label={t('menu.open')}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md',
          'border-border bg-surface text-ink-secondary border',
          'duration-fast transition-colors ease-out',
          'hover:bg-subtle hover:text-ink-primary',
          'focus-visible:shadow-focus focus-visible:outline-none',
          className,
        )}
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'bg-overlay fixed inset-0 z-40 backdrop-blur-sm',
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
          )}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-[min(20rem,85vw)] flex-col',
            'bg-surface text-ink-primary shadow-xl',
            'data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right',
          )}
        >
          <header className="border-border-subtle flex items-center justify-between border-b px-5 py-4">
            <Dialog.Title className="text-ink-primary text-base font-semibold">
              {t('menu.title')}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t('actions.close')}
              className={cn(
                '-mr-2 inline-flex h-8 w-8 items-center justify-center rounded-md',
                'text-ink-tertiary hover:bg-subtle hover:text-ink-primary',
                'focus-visible:shadow-focus focus-visible:outline-none',
              )}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </header>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
            {hasSelection ? (
              <div className="bg-subtle/60 rounded-lg px-3 py-2.5">
                <PollingIndicator
                  lastUpdatedAt={lastUpdatedAt}
                  isHistorical={isHistorical}
                  isError={isError}
                />
              </div>
            ) : null}

            <Section title={t('menu.appearance')}>
              <Segmented
                ariaLabel={t('theme.label')}
                options={themeOptions}
                value={preference}
                onChange={setPreference}
              />
            </Section>

            <Section title={t('menu.language')}>
              <Segmented
                ariaLabel={t('language.label')}
                options={languageOptions}
                value={language}
                onChange={(next) => {
                  void i18n.changeLanguage(next);
                }}
              />
            </Section>

            <Section title={t('menu.testing')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p id="aqm-fault-mode" className="text-ink-primary text-sm font-medium">
                    {t('faultMode.label')}
                  </p>
                  <p className="text-ink-tertiary mt-0.5 text-xs leading-snug">
                    {t('faultMode.description')}
                  </p>
                </div>
                <Switch
                  checked={faultEnabled}
                  onCheckedChange={setFaultEnabled}
                  tone="error"
                  aria-labelledby="aqm-fault-mode"
                />
              </div>
            </Section>

            <Section title={t('menu.data')}>
              {resetStatus === 'done' ? (
                <p className="text-ink-primary flex items-center gap-2.5 text-sm font-medium">
                  <span className="bg-success/10 text-success inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {t('mockDb.resetDone')}
                </p>
              ) : confirmingReset ? (
                <div className="border-border bg-subtle/50 flex flex-col gap-3 rounded-lg border p-3">
                  <p className="text-ink-secondary text-sm leading-snug">{t('mockDb.resetBody')}</p>
                  {resetStatus === 'error' ? (
                    <p className="text-error text-sm">{t('mockDb.resetError')}</p>
                  ) : null}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setConfirmingReset(false);
                      }}
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      loading={resetStatus === 'resetting'}
                      onClick={() => {
                        void reset().then((ok) => {
                          if (ok) setConfirmingReset(false);
                        });
                      }}
                    >
                      {t('mockDb.reset')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  leadingIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setConfirmingReset(true);
                  }}
                >
                  {t('mockDb.reset')}
                </Button>
              )}
            </Section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
