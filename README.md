# Air Quality Monitor

[![CI](https://github.com/gabryel85/air-quality-monitor/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gabryel85/air-quality-monitor/actions/workflows/ci.yml)

> Frontend recruitment task — air quality measurement dashboard for European cities.
> Portfolio-grade implementation: React 19 + TypeScript (max strict) + Redux Toolkit + RTK Query + Reselect + visx + Tailwind + MSW.

**Live demo:** _(Vercel auto-deploys on every push to `main` — URL pasted here after first successful deploy)_

---

## What it does

An analyst picks a country and a year, sees a sortable table of measurement stations (NO₂, CO, PM₁₀) with a synchronized bar chart above it. They can filter cities by name, click into a city to read its notes, add new notes, edit existing ones — and **share any view by copy-pasting the URL**. Polling refreshes data every 20 s without disturbing sort, filter, scroll, or open modals.

### Key features

- **URL is the source of truth.** Country, year, filter, sort, and the currently open note modal are all in the URL. Refresh, back/forward, and "send my colleague a link" all just work.
- **Polling-safe UX.** Filter and sort survive the 20-second poll cycle; loading skeletons only appear on the _first_ fetch (or on country/year change), not on every refetch.
- **Sensor failures are first-class.** Null measurement values render as `—` with a screen-reader-friendly tooltip; entire-station outages drop rows gracefully. Nulls sort last regardless of direction.
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
│   │   │   ├── molecules/          FormField, Select, EmptyState, ErrorState, PollingIndicator,
│   │   │   │                       ThemeToggle, LanguageToggle
│   │   │   └── organisms/          Modal, DataTable, BarChart (visx), NoteCard, AppHeader,
│   │   │                           ErrorBoundary fallback
│   │   ├── features/               Domain-specific wiring
│   │   │   ├── cities/             API + selectors (Reselect) + CitiesTable + Toolbar + tableSlice
│   │   │   ├── countries/          API + CountrySelect + YearSelect
│   │   │   ├── filters/            filtersSlice + URL sync (UrlSyncProvider + listeners)
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

                URL ↔ Redux mirror
            ┌────────────────────────┐
            │  ?country, ?year, ?q   │
            │  ?sort, ?modal, ?noteId│
            └────────────────────────┘
            (listenerMiddleware writes URL on store actions;
             UrlSyncProvider reads URL → dispatches to store)
```

---

## Decision Log

> The "why" behind every non-obvious choice — what a recruiter would ask in interview.

### 1. URL is the source of truth, Redux mirrors it

Every meaningful piece of state (country, year, filter, sort, open modal, selected note) lives in URL search params. `UrlSyncProvider` is a bidirectional sync at the route shell:

- **URL → store:** `useSearchParams()` change → `parseUrlState` → `dispatch(setAllFromUrl)`.
- **Store → URL:** `listenerMiddleware` watches filter / sort actions, serializes state, calls `navigate({search}, {replace: true})`.

A `lastWrittenRef` guards against feedback loops. Defaults and empty values are stripped from the URL for cleaner shareable links.

**Why:** Back/forward, refresh, deep-link sharing — all work for free. Polling cannot disturb filter or sort because they aren't part of the fetch lifecycle.

### 2. RTK Query + Reselect (not "RTK Query OR Reselect")

The brief asked for **Redux + Reselect**. I'm using both — but with clearly distinct jobs:

- **RTK Query** owns: fetch lifecycle, cache, polling, retry, dedup, invalidation.
- **Reselect** owns: pure derivation on top of cache and slice state (`selectFilteredCities → selectSortedCities → selectChartData`).

RTK Query internally uses Reselect for endpoint selectors (`endpoint.select(args)(state)`). The explicit `createSelector` chain on top is what tests pin down (`selectors.test.ts`) and what the chart/table consume — memoised by reference, so polling that returns identical data triggers zero re-renders.

**Why this over plain thunks:** Polling, retry, dedup, isLoading vs isFetching are ~150 lines I'd otherwise have to write by hand. The Reselect layer is where the _interesting_ memoised logic lives — that's where the unit tests are.

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
- Chaos is one-liner: random 200-800 ms delay, 5 % chance of 503, 10 % per-measurement nulls, 10 % chance of row omission. This is what stress-tested every loading / error / null / retry branch of the UI.
- Vercel deploys it cleanly (service worker static at `/mockServiceWorker.js`).

**Trade-off:** I could have spent two days on a NestJS backend with TypeORM and a real DB. The recruiter sees frontend code; deeper FE polish was the better use of the budget.

### 6. visx instead of Recharts

The bar chart is built directly with `@visx/scale` + `@visx/axis` + `@visx/tooltip`. ~150 lines vs ~30 with Recharts — more code but:

- Precise brand control (ING orange, font sizes match design tokens to the pixel).
- I show I understand the underlying d3-scale primitives, not just a wrapper.
- For ~10 bars, the abstraction of a full chart lib was overkill anyway.

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

Conscious decision: `skipPollingIfUnfocused: false`. Defence — this is a **monitoring dashboard for analysts**. They Alt-Tab away to reference docs or Slack, then return; expectation is "the data is current," not "5-minute-old snapshot."

In production with real costs, I'd add a Page Visibility API gate at the 5-minute mark, but for the 20-second cadence here it's the right call.

---

## What I'd add with more time

| Area                          | What                                       | Why                                             |
| ----------------------------- | ------------------------------------------ | ----------------------------------------------- |
| E2E                           | One Playwright happy-path                  | Locked-in proof the full flow works             |
| Storybook + visual regression | Stories per component, Chromatic snapshots | Component-driven dev demo, regression safety    |
| Real backend                  | NestJS + Postgres + Auth                   | Would extend further into the "fullstack" claim |

### ✅ Already done

| Area              | What                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Code-splitting    | Lazy `NotesPage` + lazy `BarChart` + manual vendor chunks. Initial ~220 KB gz across cacheable chunks (was 226 KB monolith). |
| Integration tests | RTL + MSW: sort cycle, filter-survives-refetch, note creation flow.                                                          |
| axe-core in tests | Automated a11y assertions on `DashboardPage` (loaded + empty state).                                                         |
| Mobile responsive | Table → cards on `<sm`; chart axis margins shrink on narrow viewports.                                                       |
| Real backend      | NestJS + Postgres + Auth                                                                                                     | Would extend further into the "fullstack" claim |

---

## Out of scope (per spec)

- Real backend (mocked with MSW per PDF allowance)
- Real-time updates (PDF explicitly excluded WebSocket / SSE)
- Historical time-series (only year-snapshot per spec)
- Export to CSV/PDF, map view, multi-country comparison
- Authentication
- Push / email notifications
- Rich text or attachments in notes

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
