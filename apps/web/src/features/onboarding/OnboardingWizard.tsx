/**
 * OnboardingWizard — the dashboard's first-run experience.
 *
 * Shown while no country/year is selected. Three guided steps (country →
 * year → city) with a location-based suggestion pre-filled from the visitor's
 * IP (timezone fallback). Finishing dispatches the filter selection, which
 * swaps the wizard out for the normal dashboard; picking a city instead
 * deep-links straight to that city's notes.
 */

import { ArrowLeft, ArrowRight, Building2, Calendar, Check, Gauge, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/app/hooks';
import { Button } from '@/components/atoms/Button';
import { Combobox, type ComboboxOption } from '@/components/molecules/Combobox';
import { setCountry, setYear } from '@/features/filters/filtersSlice';
import { cn } from '@/lib/utils';
import { CITIES_BY_COUNTRY, COUNTRIES } from '@/mocks/seed';

import { flagEmoji } from './geo';
import { useGeoSuggestion } from './useGeoSuggestion';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS: readonly number[] = [
  CURRENT_YEAR - 3,
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
];

const STEP_ICONS = [MapPin, Calendar, Building2] as const;

export function OnboardingWizard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const geo = useGeoSuggestion();

  const [step, setStep] = useState(0);
  const [pickedCountry, setPickedCountry] = useState<string | null>(null);
  const [year, setYearValue] = useState<number>(CURRENT_YEAR);
  // `undefined` = untouched (use the geo-detected city); `null` = cleared.
  const [pickedCity, setPickedCity] = useState<string | null | undefined>(undefined);

  const country = pickedCountry ?? geo.countryId;
  const cityId = pickedCity === undefined ? geo.cityId : pickedCity;

  const countryName = COUNTRIES.find((c) => c.id === country)?.name ?? country;
  const cities = CITIES_BY_COUNTRY[country] ?? [];
  const selectedCityName = cities.find((c) => c.cityId === cityId)?.city ?? null;

  const countryOptions: ReadonlyArray<ComboboxOption<string>> = COUNTRIES.map((c) => ({
    value: c.id,
    label: c.name,
    keywords: [c.id],
  }));

  const stepLabels = [
    t('onboarding.stepCountry'),
    t('onboarding.stepYear'),
    t('onboarding.stepCity'),
  ];

  function complete(targetCityId: string | null): void {
    dispatch(setCountry(country));
    dispatch(setYear(year));
    if (targetCityId) {
      const search = new URLSearchParams({ country, year: String(year) });
      navigate({
        pathname: `/cities/${encodeURIComponent(targetCityId)}/notes`,
        search: `?${search.toString()}`,
      });
    }
  }

  return (
    <section
      aria-label={t('onboarding.welcomeTitle')}
      className="border-border bg-surface mx-auto w-full max-w-2xl overflow-hidden rounded-xl border shadow-sm"
    >
      {/* Hero */}
      <header className="from-accent/10 border-border-subtle border-b bg-gradient-to-br to-transparent px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="bg-accent text-ink-on-accent inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm">
            <Gauge className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-ink-primary text-lg font-semibold tracking-tight">
              {t('onboarding.welcomeTitle')}
            </h2>
            <p className="text-ink-secondary text-sm">{t('onboarding.welcomeSubtitle')}</p>
          </div>
        </div>
        <Stepper current={step} labels={stepLabels} />
      </header>

      {/* Step body — re-keyed so each step plays the entrance animation. */}
      <div key={step} className="animate-slide-up-fade px-6 py-7">
        {step === 0 ? (
          <CountryStep
            loading={geo.loading}
            country={country}
            countryName={countryName}
            source={geo.source}
            isSuggestion={pickedCountry === null}
            options={countryOptions}
            onPick={setPickedCountry}
          />
        ) : null}
        {step === 1 ? <YearStep year={year} onPick={setYearValue} /> : null}
        {step === 2 ? (
          <CityStep
            cities={cities}
            selectedCityId={cityId}
            detectedCityId={geo.cityId}
            onToggle={(id) => {
              setPickedCity(cityId === id ? null : id);
            }}
          />
        ) : null}
      </div>

      {/* Footer */}
      <footer className="border-border-subtle bg-subtle/40 flex items-center gap-2 border-t px-6 py-4">
        {step > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            onClick={() => {
              setStep((s) => s - 1);
            }}
          >
            {t('onboarding.back')}
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="text-ink-tertiary ml-auto"
          onClick={() => {
            complete(null);
          }}
        >
          {t('onboarding.skipSetup')}
        </Button>
        {step < 2 ? (
          <Button
            variant="primary"
            size="sm"
            trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={() => {
              setStep((s) => s + 1);
            }}
          >
            {t('onboarding.next')}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            trailingIcon={<Check className="h-3.5 w-3.5" />}
            onClick={() => {
              complete(cityId);
            }}
          >
            {cityId && selectedCityName
              ? t('onboarding.openCity', { city: selectedCityName })
              : t('onboarding.finish')}
          </Button>
        )}
      </footer>
    </section>
  );
}

function Stepper({ current, labels }: { readonly current: number; readonly labels: string[] }) {
  return (
    <ol className="mt-5 flex items-center gap-2">
      {labels.map((label, index) => {
        const Icon = STEP_ICONS[index] ?? MapPin;
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={active ? 'step' : undefined}
              className={cn(
                'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                'duration-fast transition-colors ease-out',
                active && 'border-accent bg-accent text-ink-on-accent',
                done && 'border-accent text-accent bg-transparent',
                !active && !done && 'border-border text-ink-tertiary bg-surface',
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                active ? 'text-ink-primary' : 'text-ink-tertiary',
              )}
            >
              {label}
            </span>
            {index < labels.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn('h-px flex-1', index < current ? 'bg-accent' : 'bg-border')}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

interface CountryStepProps {
  readonly loading: boolean;
  readonly country: string;
  readonly countryName: string;
  readonly source: 'ip' | 'timezone' | 'default';
  readonly isSuggestion: boolean;
  readonly options: ReadonlyArray<ComboboxOption<string>>;
  readonly onPick: (next: string) => void;
}

function CountryStep({
  loading,
  country,
  countryName,
  source,
  isSuggestion,
  options,
  onPick,
}: CountryStepProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="relative inline-flex h-14 w-14 items-center justify-center">
          <span className="bg-accent/20 absolute inset-0 animate-ping rounded-full" />
          <span className="bg-accent/10 text-accent relative inline-flex h-14 w-14 items-center justify-center rounded-full">
            <MapPin className="h-6 w-6 animate-pulse" aria-hidden="true" />
          </span>
        </span>
        <p className="text-ink-secondary text-base" role="status">
          {t('onboarding.detecting')}
        </p>
      </div>
    );
  }

  const sourceLabel =
    source === 'ip'
      ? t('onboarding.suggestionIp')
      : source === 'timezone'
        ? t('onboarding.suggestionTimezone')
        : t('onboarding.suggestionDefault');

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-ink-primary text-base font-semibold">{t('onboarding.countryHeading')}</h3>

      <div className="border-border-subtle bg-subtle/50 flex items-center gap-4 rounded-lg border p-4">
        <span className="text-4xl leading-none" aria-hidden="true">
          {flagEmoji(country)}
        </span>
        <div className="min-w-0">
          <p className="text-ink-tertiary text-xs uppercase tracking-wide">
            {isSuggestion ? t('onboarding.weThinkYoureIn') : t('onboarding.chooseCountry')}
          </p>
          <p className="text-ink-primary truncate text-xl font-semibold">{countryName}</p>
          {isSuggestion ? <p className="text-ink-tertiary text-xs">{sourceLabel}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-ink-secondary text-xs font-medium uppercase tracking-wide">
          {t('onboarding.orPickAnother')}
        </span>
        <Combobox<string>
          value={country}
          onValueChange={onPick}
          options={options}
          placeholder={t('labels.country')}
          searchPlaceholder={t('labels.searchCountry')}
          emptyMessage={t('labels.noCountryFound')}
        />
      </div>
    </div>
  );
}

function YearStep({
  year,
  onPick,
}: {
  readonly year: number;
  readonly onPick: (y: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-ink-primary text-base font-semibold">{t('onboarding.yearHeading')}</h3>
        <p className="text-ink-secondary mt-1 text-sm">{t('onboarding.yearSubtitle')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {YEARS.map((value) => {
          const active = value === year;
          const isCurrent = value === CURRENT_YEAR;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => {
                onPick(value);
              }}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-4',
                'duration-fast transition-colors ease-out',
                'focus-visible:shadow-focus focus-visible:outline-none',
                active
                  ? 'border-accent bg-accent/5 text-ink-primary'
                  : 'border-border bg-surface text-ink-secondary hover:border-border-strong',
              )}
            >
              <span className="font-mono text-xl font-semibold">{value}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide',
                  isCurrent ? 'bg-success/10 text-success' : 'bg-muted text-ink-tertiary',
                )}
              >
                {isCurrent ? t('onboarding.yearLive') : t('onboarding.yearArchive')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CityStepProps {
  readonly cities: ReadonlyArray<{ readonly cityId: string; readonly city: string }>;
  readonly selectedCityId: string | null;
  readonly detectedCityId: string | null;
  readonly onToggle: (cityId: string) => void;
}

function CityStep({ cities, selectedCityId, detectedCityId, onToggle }: CityStepProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-ink-primary text-base font-semibold">{t('onboarding.cityHeading')}</h3>
        <p className="text-ink-secondary mt-1 text-sm">{t('onboarding.citySubtitle')}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => {
          const active = city.cityId === selectedCityId;
          const detected = city.cityId === detectedCityId;
          return (
            <button
              key={city.cityId}
              type="button"
              aria-pressed={active}
              onClick={() => {
                onToggle(city.cityId);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm',
                'duration-fast transition-colors ease-out',
                'focus-visible:shadow-focus focus-visible:outline-none',
                active
                  ? 'border-accent bg-accent text-ink-on-accent'
                  : 'border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink-primary',
              )}
            >
              {detected ? <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              {city.city}
            </button>
          );
        })}
      </div>
      <p className="text-ink-tertiary text-xs">{t('onboarding.skipCity')}</p>
    </div>
  );
}
