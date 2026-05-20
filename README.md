# Air Quality Monitor

[![CI](https://github.com/gabryel85/air-quality-monitor/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gabryel85/air-quality-monitor/actions/workflows/ci.yml)

> Frontend recruitment task — air quality measurement dashboard for European cities.
> Built with React 19 + TypeScript (strict) + Redux Toolkit + RTK Query + Reselect + visx + Tailwind + MSW.

**Live demo:** **https://air-quality-monitor-web-xdym.vercel.app**
(Vercel auto-deploys on every push to `main`.)

---

## What it does

An analyst picks a country and a year, sees a sortable table of measurement stations (NO₂, CO, PM₁₀) with a synchronized bar chart above it. They can filter cities by name, click into a city to read its notes, add new notes, edit existing ones — and **share any view by copy-pasting the URL**. Polling refreshes data every 20 s without disturbing sort, filter, scroll, or open modals.

### Key features

- **URL is the source of truth.** Country, year, filter, sort, and the currently open note modal are all in the URL. Refresh, back/forward, and "send my colleague a link" all just work.
- **Polling-safe UX.** Filter and sort survive the 20-second poll cycle; loading skeletons only appear on the _first_ fetch (or on country/year change), not on every refetch.
- **Sensor failures are first-class.** Null measurement values render as `—` with a screen-reader-friendly tooltip; entire-station outages drop rows gracefully. Nulls sort last regardless of direction.
- **Per-city trend chart.** Clicking a city opens its detail with a pollutant time-series (24h / 7d / 30d / yearly), three toggleable lines (NO₂/CO/PM₁₀) and an AQI badge — this is where the "24h" view is genuinely live.
- **Historical-year guard.** A past year's annual snapshot can't change, so polling is switched off for it and a "closed year — historical data" indicator replaces the live pulse.
- **Searchable controls.** Country picker is a type-to-filter combobox (matches name _and_ ISO code); the city filter has contains / exact / starts-with modes via an icon toggle inside the field.
- **Accessible.** Keyboard nav across the whole app, focus rings on every interactive element, `aria-sort` on table columns, `aria-live` regions for loading/filter changes, full focus trap in modals (Radix), `prefers-reduced-motion` honoured.
- **Brand-tokens.** ING palette via CSS variables; light + dark + auto theme with no flash on first paint.
- **Bilingual.** Polish + English via `react-i18next`.

---

## Run locally

```bash
pnpm install
pnpm dev            # → http://localhost:5173
```

That's it. MSW intercepts every `/api/*` call — no real backend needed.

| Command          | What it does                                |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Vite dev server with MSW worker             |
| `pnpm build`     | Type-check + production build               |
| `pnpm preview`   | Serve the production build locally on :4173 |
| `pnpm test`      | Vitest watch mode                           |
| `pnpm test:run`  | Vitest once (CI)                            |
| `pnpm lint`      | ESLint, `--max-warnings=0`                  |
| `pnpm typecheck` | TypeScript without emitting                 |
| `pnpm format`    | Prettier --write across the repo            |

Requires: Node ≥ 20, pnpm ≥ 10 (auto-installed via Corepack).

---

## Architecture

```
ing/
├── apps/web/                       React frontend (Vite)
│   ├── src/
│   │   ├── app/                    Store, router, providers
│   │   ├── components/             Atomic Design — generic, domain-agnostic
│   │   │   ├── atoms/              Button, Input, Skeleton, Badge, Spinner, Kbd, Icon
│   │   │   ├── molecules/          FormField, Select, Combobox, EmptyState, ErrorState,
│   │   │   │                       PollingIndicator, ThemeToggle, LanguageToggle
│   │   │   └── organisms/          Modal, DataTable, BarChart (visx), CityCard, NoteCard,
│   │   │                           AppHeader, ErrorBoundary fallback
│   │   ├── features/               Domain-specific wiring
│   │   │   ├── cities/             API + selectors (Reselect) + CitiesTable + Toolbar
│   │   │   │                       + CityTrendChart + tableSlice + citySeriesApi
│   │   │   ├── countries/          API + CountrySelect (combobox) + YearSelect
│   │   │   ├── filters/            filtersSlice + URL sync (UrlSyncProvider) + CityFilterInput
│   │   │   ├── notes/              API + 3 modals + NoteModalRouter + NotesListInfinite
│   │   │   └── theme/              ThemeProvider + useTheme
│   │   ├── templates/              AppShell
│   │   ├── pages/                  DashboardPage, NotesPage, NotFoundPage
│   │   ├── mocks/                  MSW handlers + seed data + chaos simulation
│   │   ├── lib/                    cn, sort (nulls-last), relativeTime, useDebouncedValue
│   │   ├── i18n/                   PL + EN locales
│   │   └── styles/                 tokens.css (CSS variables, both themes)
│   ├── tailwind.config.ts          Maps CSS vars to utility classes
│   └── vitest.config.ts
├── .design/air-quality-monitor/   Design package (brief, IA, tokens, tasks, sample components)
├── pnpm-workspace.yaml
└── tsconfig.base.json              Strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes
```

### Data flow

```
                       MSW (in-browser mock)
                              │
                              ▼
  RTK Query (cache + polling + retry)
       │
       ├─▶ getCountries, getYears   ──▶ <CountrySelect>, <YearSelect>
       │
       ├─▶ getCitiesStats (poll 20s) ──▶ Reselect chain
       │                                  │
       │                                  ├─▶ <CitiesTable>
       │                                  └─▶ <BarChart>
       │
       └─▶ getNotes (infinite query)
           createNote / updateNote ──▶ invalidates → list refetches

                URL — the shared source of truth
            ┌──────────────────────────────────────────┐
            │ ?country ?year ?q ?mode ?sort            │
            │     ↕ mirrored with Redux via UrlSyncProvider
            │ ?modal ?noteId                           │
            │     → read directly by NoteModalRouter   │
            │       (URL-only, no Redux slice)         │
            └──────────────────────────────────────────┘
```

---

## Architecture decisions

> The rationale behind each non-obvious choice.

### 1. URL is the source of truth

Every meaningful piece of state lives in the URL search params — in two tiers:

- **Mirrored with Redux** — `country`, `year`, `q` (city filter), `mode` (filter match mode), `sort`. `UrlSyncProvider`, mounted once at the route shell, keeps these in sync with the `filters` + `table` slices, both directions.
- **URL-only, no Redux mirror** — `modal` + `noteId` (the open note modal). `NoteModalRouter` reads these straight from `useSearchParams` and conditionally mounts the right modal. There is deliberately no slice for it: ephemeral view state already fully represented by the URL doesn't need a second home.

`UrlSyncProvider`'s two effects:

- **URL → store:** on a `useSearchParams()` change, `parseUrlState` reads country / year / q / mode / sort and dispatches `setAllFromUrl` / `setSort`. Invalid values are silently dropped — a bad pasted link never crashes the app.
- **Store → URL:** when those slices change, state is serialized and pushed via `setSearchParams(…, { replace: true })` — _replace_, not push, so a keystroke doesn't spam the history stack.

Two guards keep it stable:

- a `lastWrittenRef` so a URL the provider just wrote doesn't bounce straight back into the store;
- a `hasReadInitialUrl` flag so the Store→URL write waits until the initial URL has hydrated Redux — otherwise a deep-linked `?country=PL&year=2025` would be wiped by the empty initial store on first paint.

Defaults and empty values are stripped for clean shareable links. There is **no listener middleware** — sync is entirely component-driven, which keeps the data flow in one readable file.

**Why:** back/forward, refresh, and deep-link sharing all work for free. Polling cannot disturb filter or sort because they aren't part of the fetch lifecycle.

### 2. RTK Query + Reselect (not "RTK Query OR Reselect")

The brief asked for **Redux + Reselect**. I'm using both — but with clearly distinct jobs:

- **RTK Query** owns: fetch lifecycle, cache, polling, retry, dedup, invalidation.
- **Reselect** owns: pure derivation on top of cache and slice state (`selectFilteredCities → selectSortedCities → selectChartData`).

RTK Query internally uses Reselect for endpoint selectors (`endpoint.select(args)(state)`). The explicit `createSelector` chain on top is what tests pin down (`selectors.test.ts`) and what the chart/table consume — memoised by reference, so polling that returns identical data triggers zero re-renders.

**Why this over plain thunks:** polling, retry, dedup, and the `isLoading` vs `isFetching` distinction would otherwise be roughly 150 lines of hand-written boilerplate. The Reselect layer holds the memoised derivation logic, and is covered directly by unit tests (`selectors.test.ts`).

### 3. Polling-safe UX via `isLoading` vs `isFetching`

```ts
// selectors.ts
selectCitiesLoading; // status === 'pending' && data === undefined  → show skeleton
selectCitiesFetching; // status === 'pending'                         → subtle pulse only
```

Skeletons render only on the _first_ fetch (or on a country/year change — that's a context switch). On routine 20-second polls, the table and chart stay visible; only the `<PollingIndicator>` pulses. Sort, filter, scroll position survive automatically because they don't live in the fetch path.

### 4. Nulls-last sort, always

`sortWithNullsLast` in `lib/sort.ts` puts `null` rows after real data regardless of direction. Sensor failures are _information_, but ranking the top of "highest NO₂" by stations-that-are-broken would mislead an analyst. Visible at the bottom, marked `—` with `<abbr title="Sensor unavailable">` for both sighted and screen-reader users.

### 5. MSW over a real backend

The PDF explicitly allowed mocking. I chose MSW because:

- One install, no separate process to start, no Docker, no migration scripts.
- It runs the _exact same_ code in dev, prod, and tests.
- **Deterministic failure simulation.** A hash of `(country, year, city)` decides the 10 % null measurements and 10 % omitted rows — so a sensor failure is _stable_ for a given selection and polling never flickers a station in and out. The 503 retry path is opt-in via `?forceError=1`, not a random 5 %: normal polling stays predictable, yet the error/retry branch is still demonstrable on demand. Only the 200-800 ms response delay is random. This is what stress-tested every loading / error / null / retry branch of the UI.
- Vercel deploys it cleanly (service worker static at `/mockServiceWorker.js`).

**Trade-off:** a real backend (NestJS + TypeORM + a database) was an option but would not change what this task is about — the frontend. The time went into frontend depth instead.

### 6. visx instead of Recharts

The bar chart is built directly with `@visx/scale` + `@visx/axis` + `@visx/tooltip`. ~150 lines vs ~30 with Recharts — more code but:

- Precise brand control — ING orange and font sizes map directly to the design tokens, with no chart-library defaults to override.
- Direct use of the scale/axis primitives keeps full control over rendering and the null-gap handling.
- For ~10 bars, a full charting library would be more abstraction than the problem needs.

### 7. Atomic Design + features hybrid

```
components/{atoms,molecules,organisms}  — generic, domain-agnostic, reusable
features/{cities,countries,filters,notes,theme}  — domain logic + Redux + data
templates/AppShell                       — layout shells
pages/                                   — route-level composition
```

Pure Atomic Design loses domain context (`CityTable` lands in `organisms/` next to `Table`). Pure feature-folders lose visual reusability. The hybrid keeps **components** as the design system and **features** as the business logic — clean boundary between "how it looks" and "what it means".

### 8. ING design tokens, semantic over primitive

```css
:root {
  --color-accent-primary: #ff6200; /* ING orange */
  --color-bg-canvas: #faf8f4; /* warm cream */
  --color-text-on-accent: #ffffff; /* button text */
}
:root.dark {
  --color-accent-primary: #ff7c24; /* lighter for dark bg contrast */
  --color-text-on-accent: #0f0f11; /* dark text on lighter orange = 7.3:1 AAA */
}
```

Components reference _semantic_ tokens (`bg-canvas`, `text-on-accent`), never primitives. Theme switching changes variable values, components untouched. WCAG AA contrast audited for every pair (see `.design/air-quality-monitor/DESIGN_TOKENS.md`).

### 9. TypeScript max strict, no escape hatches

Every TS option that catches a real bug class is on:

```json
"strict": true,
"noUncheckedIndexedAccess": true,        // arr[0] is T | undefined → forces guard
"exactOptionalPropertyTypes": true,      // can't pass undefined to optional prop
"noImplicitOverride": true,
"noFallthroughCasesInSwitch": true,
"noUnusedLocals": true, "noUnusedParameters": true
```

This caught real issues during development (Radix prop types rejected `undefined` spreads, Reselect cache slot type mismatches). Conditional prop spreads `...(value !== undefined ? { value } : {})` is the consistent fix.

### 10. Polling always-on (no `skipPollingIfUnfocused`)

`skipPollingIfUnfocused: false` is set deliberately. Rationale: this is a monitoring dashboard for analysts who switch away to reference material and return expecting current data, not a several-minutes-old snapshot.

In a production system with real request costs, a Page Visibility API gate (pausing after a few minutes idle) would be the next step; at the 20-second cadence here, always-on polling is appropriate.

### 11. What "24H" means — and the historical-year guard

The endpoint is `GET /api/country/{id}/cities/stats/24H`, yet requirement #1 says the table is fed by selecting a **year**. Read naively that's a contradiction ("the last 24 hours of 2023"?).

It resolves once you read `24H` as the **averaging window of the metric**, not "the last 24 hours". EU air-quality law (Directive 2008/50/EC) defines limits on **24-hour mean** PM₁₀/NO₂. So:

- `/cities/stats/24H` → statistics computed over **24-hour averaging windows**
- `maxNO2 / maxCO / maxPM10` → the **annual maximum** of that 24h mean
- `?year=YYYY` → which year to take that maximum over

No contradiction: the dashboard is an **annual snapshot** ("the worst 24-hour mean of the year, per city"). `24H` is a unit, not a control.

That also fixes the polling question. A past year's annual max is **frozen** — polling it would re-fetch identical bytes. So polling runs **only for the current year**; selecting a past year switches it off and shows a "closed year — historical data" indicator (`Toolbar.tsx`, `PollingIndicator`).

The genuinely-live "last 24 hours" lives where it belongs — the **per-city trend chart** (`CityTrendChart`), whose `24h` range really is the most recent 24 hours and really does move.

### 12. Mock data shaped after a real API (Ambee), not a real API call

The per-city time-series mock (`mocks/series.ts`) is modelled on the **Ambee Air Quality `history` endpoint**: time-stamped points, per-pollutant values, a composite `AQI`, and an `aqiInfo.category`. Values follow real rhythms — diurnal rush-hour peaks, weekend dips, winter heating-season highs — and are deterministic per `(city, timestamp)` so polling never makes the chart jump.

A real API was considered and rejected for this task: API keys cannot ship in a public repository (it breaks "clone & run"), no real API matches the PDF's `maxNO2`-per-city-per-year contract (that aggregation is a backend job the brief excludes), and CORS, rate limits, and non-determinism would all undermine a clean clone-and-run experience. MSW provides the same realism without any of that.

### 13. Searchable combobox for country, plain select for year

With 13 countries a typeahead-only `<select>` is clumsy. `CountrySelect` is a combobox — **Radix Popover** for the floating panel + focus management, **cmdk** for the filtered, keyboard-navigable list. The filter matches the country name _and_ its ISO code, so typing `PL` finds `Polska`. `YearSelect` stays a plain Radix `Select` — four options, search would add nothing. Right tool per cardinality; both share the same token-styled trigger so they look identical.

### 14. City filter — substring by default, exact / starts-with as modes

The PDF says "filter by typing any string" → substring matching is the literal reading and the default. Exact and starts-with are offered as a bonus, cycled by an **icon button inside the search field** (`✳` contains, `=` exact, `»` starts-with) rather than a separate labelled control — keeps the toolbar uncluttered. The mode is URL state (`?mode=`) like every other filter, so a filtered view is fully shareable.

### 15. Code-splitting — lazy routes + manual vendor chunks

`NotesPage` and `BarChart` (the visx tree) are `React.lazy`; the MSW worker is a dynamic import. `vite.config.ts`'s `manualChunks` splits React / Redux / Radix / visx / i18n / forms into separately-cacheable vendor files, so an app-code fix invalidates `index.js` (~21 KB gz) and nothing else. Match order matters — `react-router` must be tested before the generic `react-dom` substring, or `react-router-dom` is swept into the React chunk (caught by reading the post-build chunk sizes).

---

## What I'd add with more time

| Area                          | What                                       | Why                                             |
| ----------------------------- | ------------------------------------------ | ----------------------------------------------- |
| E2E                           | One Playwright happy-path                  | Locked-in proof the full flow works             |
| Storybook + visual regression | Stories per component, Chromatic snapshots | Component-driven dev demo, regression safety    |
| Real backend                  | NestJS + Postgres + Auth                   | Would extend further into the "fullstack" claim |

### ✅ Already done — beyond the original brief

| Area                  | What                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| Code-splitting        | Lazy `NotesPage` + lazy `BarChart` + manual vendor chunks across cacheable files |
| Integration tests     | RTL + MSW: sort cycle, filter-survives-refetch, note creation flow               |
| axe-core in tests     | Automated a11y assertions on `DashboardPage` (loaded + empty state)              |
| Mobile responsive     | Table → cards on `<sm`; chart axis margins adapt on narrow viewports             |
| Per-city trend chart  | visx time-series (24h / 7d / 30d / year), AQI badge, live vs historical mode     |
| Searchable country UI | Radix Popover + cmdk combobox; city filter with contains/exact/starts-with modes |

---

## Out of scope (per spec)

- Real backend (mocked with MSW per PDF allowance)
- Real-time updates (PDF explicitly excluded WebSocket / SSE — polling only)
- Export to CSV/PDF, map view, multi-country comparison
- Authentication
- Push / email notifications
- Rich text or attachments in notes

The dashboard table stays a per-year snapshot as the spec defines; the
per-city trend chart adds a genuine time-series view on top of that.

---

## Project structure for tasks & docs

```
.design/air-quality-monitor/
├── DESIGN_BRIEF.md                  Persona, principles, aesthetic, success criteria
├── INFORMATION_ARCHITECTURE.md      Routes, 10 user flows, naming, state hierarchy
├── DESIGN_TOKENS.md                 Token system + WCAG audit
├── TASKS.md                         48-task vertical-slice checklist
├── tokens.css                       (canonical copy at apps/web/src/styles/tokens.css)
├── tailwind.config.ts               (canonical copy at apps/web/tailwind.config.ts)
└── samples/                         Pre-implementation prototypes (Button, DataTable, NoteModal)
```

These artifacts were written _before_ implementation began and drove every later decision. The git history (`design:` → `foundation:` → `atoms:` → `molecules:` → `organisms:` → `features:` → `docs:`) mirrors the design flow.

---

## License

Unlicensed — recruitment task artifact, not for distribution.
