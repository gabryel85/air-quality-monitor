import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="dashboard-title" className="py-8">
      <h1 id="dashboard-title" className="text-ink-primary text-2xl font-semibold tracking-tight">
        {t('app.title')}
      </h1>
      <p className="text-ink-secondary mt-1 text-base">{t('app.subtitle')}</p>

      <div className="border-border bg-subtle/50 mt-8 rounded-lg border border-dashed p-12 text-center">
        <p className="text-ink-secondary">
          Toolbar, BarChart, and DataTable land here in Phase 2 (Atoms/Molecules/Organisms).
        </p>
      </div>
    </section>
  );
}
