# Build Tasks: Air Quality Monitor

Generated from: `.design/air-quality-monitor/DESIGN_BRIEF.md`
Companion docs: `INFORMATION_ARCHITECTURE.md`, `DESIGN_TOKENS.md`, `tokens.css`, `tailwind.config.ts`
Date: 2026-05-19
Aesthetic philosophy: **Functional Confidence** (Bloomberg/Linear/Datadog vibe + ING brand)

## How to use this list

- **Vertical slices**: each task includes structure + styling + interaction + tests (where applicable) in one slice — buildable in one session.
- **Order**: foundation → atoms → molecules → organisms → features → pages → polish → review. Within each group, **risk-first** and **visual-priority-first**.
- **Reuse notation**: each task notes whether it reuses, modifies, or creates components. Greenfield → most are *New*.

## Priority stack (when time runs short)

| Tier | Tasks | What this gives you |
|---|---|---|
| **MUST** | 1-8, 9-13, 14-18, 19-22, 23-30, 31-33, 36, 46 | Working dashboard + notes with polling, filters, sort, mutations, baseline a11y, docs |
| **SHOULD** | 34, 35, 37, 38, 39, 40, 45 | Full keyboard/screen-reader polish, responsive across all breakpoints, unit + integration tests, deploy |
| **COULD** | 41, 42, 43, 44 | E2E, axe automation, Storybook + visual regression |
| **WON'T (v1)** | — | (Already excluded in *Out of Scope* in the brief) |

Stop at any tier — every tier above is deliverable on its own.

---

## Foundation
> *Greenfield setup. Each task ends with a verifiable visible result (not just config).*

- [ ] **1. Monorepo + Vite scaffold** — `pnpm init` workspace with `apps/web` (Vite + React 18 + TS template). Configure `tsconfig.base.json` with **max strict** (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`). Folder layout: `src/{app,components/{atoms,molecules,organisms},features,templates,pages,mocks,lib,i18n,styles}`. _Verifiable: `pnpm dev` opens Vite splash; `pnpm tsc --noEmit` passes._ _New._

- [ ] **2. Tailwind + tokens** — Install Tailwind, drop in `tokens.css` and `tailwind.config.ts` from the design tokens artifacts. Import `tokens.css` in `main.tsx`. Add Inter (`@fontsource-variable/inter`) and JetBrains Mono (`@fontsource/jetbrains-mono`). Verify in browser: `bg-canvas text-ink-primary` renders cream background with warm-black text. _Verifiable: paste a `<div class="bg-accent text-ink-on-accent p-4 rounded">Hello ING</div>` into App.tsx and see orange button-style box._ _New._

- [ ] **3. Tooling: lint, format, hooks** — ESLint (typescript-eslint, react, react-hooks, jsx-a11y) + Prettier + Husky + lint-staged. Pre-commit runs ESLint + Prettier on staged files only. Add an ESLint rule that bans hardcoded hex colors (`no-hardcoded-colors` custom or use `eslint-plugin-no-color-literals`). _Verifiable: `git commit` triggers hooks; intentional hex literal in a file fails lint._ _New._

- [ ] **4. Theme system** — JS bootstrap in `index.html` `<head>` reads `localStorage['theme']`, sets `data-theme` attribute + toggles `.dark` class on `<html>`. Create `ThemeProvider` context (React) + `useTheme` hook. Build `ThemeToggle` molecule cycling light → dark → auto with icons (`Sun` / `Moon` / `Monitor` from lucide-react) and proper `aria-label`. Listen to `prefers-color-scheme` change when in `auto`. _Verifiable: cycling through three states changes background and persists across reload; system theme change picks up immediately in auto mode._ _New._

- [ ] **5. i18n setup** — `react-i18next` + `i18next-browser-languagedetector`. Two namespaces: `pl/common.json` + `en/common.json`. Build `LanguageToggle` molecule (PL ↔ EN). Wire all UI strings via `t()` from the start — *never hardcode user-facing text*. _Verifiable: Toggle switches "Wybierz kraj" ↔ "Select a country"; persists to `localStorage['language']`._ _New._

- [ ] **6. Routing + AppShell** — React Router v6 with `createBrowserRouter`. Routes: `/` redirect to `/dashboard`, `/dashboard`, `/cities/:cityId/notes`, `*` → `NotFoundPage`. Build `AppShell` template (header + main + Toaster + theme provider) and `AppHeader` organism (logo + breadcrumb area + ThemeToggle + LanguageToggle). Wrap each route in `<ErrorBoundary>` (react-error-boundary) with route-specific fallback; outer `<ErrorBoundary>` at app root. _Verifiable: navigating between dashboard and a hardcoded `/cities/krakow/notes` updates breadcrumb; throwing an error in a route shows the per-route fallback without breaking the header._ _New._

- [ ] **7. Redux store + RTK setup** — `configureStore` with `setupListeners` for RTK Query refetch lifecycle. Create `baseQuery` wrapped with `retry({ maxRetries: 2 })` and a 5xx-only filter (don't retry 4xx). Empty `filtersSlice`, `tableSlice`, `notesUiSlice` (stubs). Configure `listenerMiddleware` skeleton. Add `<Provider>` to app root. Wire Redux DevTools. _Verifiable: DevTools shows store; dispatching a no-op action logs._ _New._

- [ ] **8. MSW handlers** — `msw` + `msw/browser`. Service worker registered in dev (and in prod build via static `mockServiceWorker.js` for Vercel). Handlers for: `GET /api/countries`, `GET /api/countries/:id/years`, `GET /api/country/:id/cities/stats/24H?year=YYYY` (returns rows with `cityId` field, random delay 200-800ms, 5% chance returns 500, 10% chance per-row null on each measurement, 10% chance row omission), `GET /api/cities/:id`, `GET /api/cities/:id/notes` (cursor-based pagination), `GET /api/cities/:id/notes/:noteId`, `POST /api/cities/:id/notes`, `PATCH /api/cities/:id/notes/:noteId`. Seed data: 3-5 countries × 3 years × 5-10 cities each; notes generated for a few cities. _Verifiable: hit each endpoint via DevTools Network and see realistic responses with simulated chaos._ _New._

## Atoms
> *First visible UI bricks. Each atom ships with Storybook stories (added in Task 43).*

- [ ] **9. Button** — Variants: `primary`, `secondary`, `ghost`, `destructive`. Sizes: `sm`, `md`, `lg`. States: default, hover, active, focus-visible (orange ring via `box-shadow: var(--shadow-focus)`), disabled, **loading** (spinner replaces text, keeps button width). Supports `as` polymorphism (renders as `<a>` for nav). **This task establishes the Functional Confidence aesthetic — restrained, no gradients, generous tap target (44px on `md`).** _New._

- [ ] **10. Input + SearchInput** — Base `Input` (text/email/url/password types, error state via aria-invalid + border-error, helper-text slot). `SearchInput` variant: leading magnifying glass icon, trailing clear-button (X) when value present, controlled debounce hook `useDebouncedValue(value, 300)`. _New._

- [ ] **11. Skeleton primitives** — Base `Skeleton` (animated via `animate-skeleton-pulse`), and specialized: `LineSkeleton` (text line, optional width), `BlockSkeleton` (rectangle), `CircleSkeleton`. Compose `TableRowSkeleton`, `TableSkeleton` (7 rows preserving column widths), `BarChartSkeleton` (placeholder bars). Animation skipped under `prefers-reduced-motion`. _New._

- [ ] **12. Badge** — Variants: `success`, `warning`, `error`, `info`, `neutral`. Composes optional icon + label. Specialized: `SensorBadge` (online/degraded/offline) with appropriate icon (Wifi / WifiOff / AlertCircle). Color never the sole indicator — always paired with icon and text. _New._

- [ ] **13. Spinner + Kbd + Icon system** — `Spinner` (sm/md/lg, screen-reader text "Loading"). `Kbd` (keyboard shortcut display: `<kbd>Esc</kbd>`). `Icon` wrapper around lucide-react that enforces consistent stroke + size + accessibility (decorative icons get `aria-hidden`). _New._

## Molecules

- [ ] **14. FormField** — Wraps `Input` (or any control) with `Label`, optional helper text, and error message. Wires `htmlFor` ↔ `id`, `aria-describedby` ↔ helper/error IDs, `aria-invalid` when error present. _New._

- [ ] **15. Select** — Built on shadcn/ui `Select` (Radix `Select` primitives). Keyboard nav (Arrow keys, Home/End), search-as-you-type, virtualized for long lists (countries OK without — use plain). Loading state ("Loading countries…") and empty state ("No countries available"). _New._

- [ ] **16. EmptyState** (3 variants) — `NoSelection` ("Select a country and year to begin"), `NoData` ("No measurements available for this selection — try another year"), `NoFilterResults` ("No cities match your filter" + "Clear filter" button). Each: icon (decorative) + heading + body + optional CTA. Centered in container. _New._

- [ ] **17. ErrorState** — Icon (AlertTriangle) + apologetic heading ("Couldn't load data") + body + **Retry button** (calls injected `onRetry`) + collapsible `<details>` with technical detail (status code, error message). For network-level errors, also offers "Reload page". _New._

- [ ] **18. PollingIndicator** — Pulsing dot (`animate-poll-pulse`) + label "Live" + relative time "updated 12s ago" (derived from `fulfilledTimeStamp` via Reselect — see Task 26). Error state: red dot + "Refresh failed" + small Retry icon button. `aria-live="polite"`. _New._

## Organisms

- [ ] **19. Modal** — Wraps shadcn/ui `Dialog` (Radix `Dialog` — focus trap, ESC, click-outside, `role="dialog"`, `aria-modal="true"` for free). Custom: full-screen on mobile (`<sm`), centered max-width on tablet+. Animated entrance (`animate-slide-up-fade`). Optional `onDirtyClose` confirmation handler ("Discard changes?"). _New._

- [ ] **20. DataTable** — *The workspace.* Sortable column headers (click cycles asc → desc → off → default-asc, `aria-sort`, focusable with Enter/Space activation). Sticky header. Hover row highlight (`bg-subtle`). **Null cell**: renders `—` in `text-ink-tertiary` with tooltip "Sensor unavailable". **Sort logic**: nulls always last regardless of direction (unit-tested). Row click handler (optional). Tabular-nums on numeric columns. Density variants (compact/normal). Mobile: transforms to card list. _Critical task — risk-first because sort + null + polling-survive interactions are core._ _New._

- [ ] **21. BarChart (visx)** — Bars for cities, X-axis labels (rotate -45° if many), Y-axis with auto-scale. ING orange fill (`var(--color-chart-bar)`), hover state, tooltip on hover/focus with exact value. Animated on data change (Framer Motion or visx `react-spring`). Null cities = no bar (visible gap), still labelled on axis. **Screen reader alternative**: visually-hidden `<table>` summarizing data. _New._

- [ ] **22. NoteCard** — Title (truncate to 1 line + ellipsis), `Created Mar 12, 2026 · Updated 2h ago`, `[Details]` + `[Edit]` buttons (right-aligned). Hover: subtle background lift + border highlight. Focus-visible: orange ring around entire card. Click on card opens details (entire card is `<button>` semantically — see ARIA pattern). _New._

## Features — wiring (the brain)

- [ ] **23. filtersSlice + URL sync** — `filtersSlice` with `country: string | null`, `year: number | null`, `q: string`. Top-level `<UrlSyncProvider>` reads `useSearchParams()` and dispatches `setAllFromUrl({ country, year, q })` on URL change. `listenerMiddleware` listens to filter actions → builds query string (alphabetical, strips defaults/empty) → calls `navigate({ search }, { replace: true })`. Normalize: invalid country code silently dropped; invalid year too. _Test: deep-link `?country=PL&year=2025&q=warsz` hydrates store correctly; manually editing URL updates store; dispatching action updates URL._ _New._

- [ ] **24. Countries + Years API + selects** — Two RTK Query endpoints. Wire `CountrySelect` molecule (uses `useGetCountriesQuery`), `YearSelect` (uses `useGetYearsQuery({ country })` — `skip: !country`). On country change, year resets (URL drops `year` param). Loading and empty states on both selects. _New._

- [ ] **25. Cities stats API with polling** — `useGetCitiesStatsQuery({ country, year }, { pollingInterval: 20000, skipPollingIfUnfocused: false })` — polling ON regardless of tab focus (decided in grilling — defense documented in README). Skip query when country or year missing. `refetchOnFocus: true`. Hook returns `{ data, isLoading, isFetching, error, refetch, fulfilledTimeStamp }`. _New._

- [ ] **26. Reselect chain + tests** — `selectFilters` (URL mirror), `selectSortConfig`, `selectRawCities` (from RTK Query cache via `endpoint.select(args)(state)`). Compose: `selectFilteredCities = createSelector([raw, q], ...)`, `selectSortedCities = createSelector([filtered, sort], sortWithNullsLast)`, `selectChartData`, `selectLastUpdatedRelative`, `selectVisibleCityCount`. **Unit tests for each** — pure functions, simple to test, demonstrates `Redux + Reselect` mastery. _New._

- [ ] **27. tableSlice + sort URL sync + DataTable wiring** — `tableSlice` with `sort: { column: 'city' | 'maxNO2' | 'maxCO' | 'maxPM10', direction: 'asc' | 'desc' }`. Default `city:asc` *omitted from URL* on serialize. Listener middleware syncs both ways. `DataTable` consumes `useAppSelector(selectSortedCities)` and `dispatch(setSort(...))` from header clicks. _New._

- [ ] **28. City filter wiring** — Toolbar input (uses `SearchInput`). `useDebouncedValue(q, 300)` → dispatches `setFilterQ(value)` → URL updates → Reselect re-filters → table + chart re-render. Empty `q` removed from URL. `aria-live="polite"` announces "Showing N cities" 500ms after filter settles. _New._

- [ ] **29. Notes API + InfiniteList** — `useGetNotesInfiniteQuery({ cityId })` using RTK Query's `infiniteQueryOptions`. Cursor pagination from MSW. `NotesListInfinite` organism: renders cards + sentinel `<div>` at bottom + intersection observer triggers `fetchNextPage()`. Skeleton cards on initial load. Empty state ("No notes yet"). Error state with retry. _New._

- [ ] **30. Note mutations** — `useCreateNoteMutation`, `useUpdateNoteMutation`. Pessimistic flow: modal save button enters loading → mutation fires → on success: toast + close modal (clear URL `?modal=...&noteId=...`) + RTK Query `invalidatesTags` on notes list. On error: inline error at top of modal form, values preserved, button shows "Try again". _New._

## Pages

- [ ] **31. DashboardPage** — Compose `Toolbar` (CountrySelect + YearSelect + SearchInput + PollingIndicator) + `BarChart` + `DataTable`. Conditional rendering: no-selection EmptyState → skeleton (initial fetch) → ErrorState (after retries fail) → data (chart above, table below). Reads `isLoading`, `isFetching`, `error` from cities stats query. _New._

- [ ] **32. NotesPage** — Compose `NotesHeader` (Back arrow + city name + "New note" button) + `NotesListInfinite` + URL-driven modal mount (`<NoteModalRouter>`). Reads city info from `useGetCityQuery`. Skeleton header + cards on initial load. _New._

- [ ] **33. NoteModal trio** — `<NoteModalRouter>` reads `?modal` and `?noteId` from URL and conditionally mounts:
  - `NewNoteModal` (`?modal=new`) — react-hook-form + zod (title 3-120, content 1-5000), Save/Cancel, pessimistic
  - `NoteDetailsModal` (`?modal=details&noteId=X`) — read-only view, single Close
  - `EditNoteModal` (`?modal=edit&noteId=X`) — title shown read-only, content editable, Save/Cancel, pessimistic, PATCH

  Closing any modal (Save success, Cancel, ESC, click-outside) writes URL without `modal`/`noteId` (back-button-friendly). Dirty-form close confirms. _New._

## Polling-safe UX + animations
> *The differentiator. These tasks are what separate "implements requirements" from "got the spirit of the brief."*

- [ ] **34. Refetch UX split: isLoading vs isFetching** — Loading skeletons only on `isLoading` (first fetch or when country/year changed). On polling refetch (`isFetching && data`), keep current table + chart visible; only PollingIndicator pulses. **Critical**: must verify in browser that sort, filter, scroll position are preserved across 20s polling cycle. _New._

- [ ] **35. Aria-live regions** — Add screen-reader regions:
  - `<div aria-live="polite">` for loading announcements ("Loading data", "N cities loaded")
  - `<div aria-live="polite">` for filter count ("Showing 3 cities", debounced 500ms)
  - `<div role="alert">` for critical errors (network failure with no cached data)
  - Modal save success uses toast (already aria-live)
  _New._

- [ ] **36. Row in/out animations** — When polling refresh adds/removes rows (sensor outage), animate `opacity` + `height` (300ms). Use Framer Motion `<AnimatePresence>` on table rows. Skip animations under `prefers-reduced-motion`. _New._

## Responsive

- [ ] **37. Dashboard responsive** — Mobile (`<sm`): toolbar items stack vertically full-width, table transforms to card list (each row = card with `label: value` rows), BarChart compresses with horizontal scroll. Tablet (`md`-`lg`): toolbar 2 rows. Desktop (`lg+`): single-row toolbar, full table, BarChart above. Test at `sm`/`md`/`lg`/`xl` breakpoints. _New._

- [ ] **38. Notes responsive** — Mobile: modal becomes full-screen sheet (slides up); list cards full-width. Tablet+: modal centered max-width 540px; list single column max-width 720px. _New._

## A11y

- [ ] **39. Keyboard polish + skip-link** — Skip-link `<a>` as first focusable element ("Skip to main content"). Filter input bound to `/` shortcut (Linear style). Sort headers focusable + Enter/Space cycles direction. Modal trap verified by tabbing through. Theme toggle accessible by `T` (optional, documented in `?` help). Help dialog `?` shows all shortcuts. _New._

- [ ] **40. WCAG manual walkthrough + axe in tests** — Install `@axe-core/react` (dev) and `vitest-axe`. Add a test suite that mounts each top-level page + each modal and asserts `axe()` passes. Manual walkthrough checklist (keyboard-only, screen reader): documented in `docs/A11Y.md`. Fix violations. _New._

## Testing

- [ ] **41. Unit tests: selectors + utils** — Vitest + sample fixture data. Test each Reselect selector with multiple inputs including null/empty/edge cases. Test `sortWithNullsLast` (asc, desc, with nulls, all-nulls, empty). Test `parseUrlParams` / `serializeUrlParams` round-trip. _New._

- [ ] **42. Integration tests (RTL)** — Vitest + RTL + MSW. Scenarios:
  1. Initial load: empty → select country → select year → table appears
  2. Sort: click maxNO2 header twice, verify order changes and arrow icon updates
  3. **Filter survives polling**: set filter "warsz" → advance fake timer 20s → verify filter and table state intact
  4. New note flow: open modal → fill form → submit → list updates
  5. Edit note flow: open edit modal → modify content → submit → card updates with new updatedAt
  6. Error retry: MSW returns 500 → ErrorState shows → click retry → success path

- [ ] **43. E2E (Playwright)** — One happy-path E2E that goes: open `/` → select country → year → sort → filter → click row → notes page → "New note" → fill → save → see in list → edit → save → back to dashboard → verify filters preserved. Run on `chromium` only (recruitment scope). _New._

## Storybook + Visual Regression

- [ ] **44. Storybook setup + stories** — `@storybook/react-vite` + `@storybook/addon-a11y` (axe panel) + dark-mode toggle addon. Stories for: Button (all variants × states), Input, SearchInput, Skeleton variants, Badge, EmptyState (3), ErrorState, PollingIndicator (live/error), Modal (all sizes), DataTable (with nulls + sorting + skeleton + empty), BarChart (with nulls + animated), NoteCard. _New._

- [ ] **45. Visual regression** — Playwright snapshot tests of key Storybook stories in light + dark. Stored under `__visual__/`. (Alternative: Chromatic if user has account.) Update screenshots committed deliberately. _New._

## Deploy + Docs

- [ ] **46. Vercel deploy + MSW prod** — Configure MSW for production builds (`PUBLIC_API_MODE=mock` env var; service worker registered conditionally). `vercel.json` for SPA fallback. Connect repo → Vercel → preview deployments per PR. _New._

- [ ] **47. README + architecture docs** — Top-level README:
  - Run instructions (`pnpm i`, `pnpm dev`, optional `pnpm storybook`, `pnpm test`, `pnpm test:e2e`)
  - Live demo link (Vercel)
  - Architecture overview (1 paragraph)
  - **Decision Log** (the headliner — quote `INFORMATION_ARCHITECTURE.md` State Hierarchy table here)
  - "Why these choices" — 6-8 of the most important: URL as truth, RTK Query + Reselect, polling-safe UX (`isLoading` vs `isFetching`), MSW over real BE, visx for chart, Atomic Design hybrid, ING brand tokens
  - Out-of-scope (from brief)
  - Tradeoffs & next steps ("with another day I would add...")
  _New._

## Review

- [ ] **48. Run `/design-review`** — Against the live built app. Captures screenshots in 3 breakpoints × light + dark for each page + each modal state. Generates `DESIGN_REVIEW.md` with prioritized findings. Must-fix items addressed in a follow-up PR. _Standalone phase from `/design-flow`._

---

## Build order rationale

1. **Why foundation first (1-8):** No vertical slice is possible without tokens, theme, store, router, and mocks. These don't make a visible feature, but every visible feature depends on them. Greenfield reality.

2. **Why atoms before features (9-13):** First visible component (Button, Task 9) cements the *Functional Confidence* aesthetic — restrained, generous radii, single orange accent. If the recruiter peeks at PR #9, they should already see the brand. Establishing aesthetic early prevents "rebuild everything" later.

3. **Why DataTable + BarChart are organisms not features (20, 21):** They're domain-agnostic primitives. The wiring (cities data, sort URL sync) is in features (Tasks 27, 28). Separating these makes both reusable and testable in isolation.

4. **Why Reselect selectors get their own task (26):** Unit tests for pure functions demonstrate `Reselect mastery` to the recruiter. Cheap to write, high signal.

5. **Why "Refetch UX" is its own task (34):** This is the single most-cited deliverable in the PDF ("nie gubił aktualnych filtrów, sortowania ani kontekstu użytkownika"). Verifying this manually + in tests is non-negotiable.

6. **Why README is the *last* task (47):** Writing it after building forces honest reflection. README written first becomes aspirational fiction.

7. **Why design-review is task 48:** It compares built reality to the brief. If brief and reality diverge, decide *intentionally* (update one, update both, or leave the gap and document why).
