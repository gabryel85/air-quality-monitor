import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { isSupportedLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

export interface LanguageToggleProps {
  readonly className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();
  const current: SupportedLanguage = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : 'pl';

  const next: SupportedLanguage =
    SUPPORTED_LANGUAGES[(SUPPORTED_LANGUAGES.indexOf(current) + 1) % SUPPORTED_LANGUAGES.length] ??
    'pl';

  const onClick = (): void => {
    void i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${t('language.label')}: ${current.toUpperCase()}. Switch to ${next.toUpperCase()}.`}
      title={t('language.label')}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-md px-2.5',
        'border-border bg-surface text-ink-secondary border',
        'duration-fast transition-colors ease-out',
        'hover:bg-subtle hover:text-ink-primary',
        'focus-visible:shadow-focus focus-visible:outline-none',
        className,
      )}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="text-xs font-semibold uppercase tracking-wide">{current}</span>
    </button>
  );
}
