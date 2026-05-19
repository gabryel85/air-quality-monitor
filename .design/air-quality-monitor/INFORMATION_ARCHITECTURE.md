# Information Architecture: Air Quality Monitor

> Companion to `DESIGN_BRIEF.md`. Defines the structural skeleton: routes, navigation, content priority, user flows, and the *State Hierarchy* (which state lives where).

## Site Map

A minimal two-route product. The URL is rich (every meaningful state is a query parameter) so the route count stays small.

```
/                                                    → redirect to /dashboard
/dashboard                                           → DashboardPage (default empty state)
/dashboard?country=PL                                → country selected, year not
/dashboard?country=PL&year=2025                      → fully loaded view
/dashboard?country=PL&year=2025&q=warsz&sort=city:asc → with filter + sort
/cities/:cityId/notes                                → NotesPage (default list)
/cities/:cityId/notes?modal=new                      → New note modal open
/cities/:cityId/notes?modal=details&noteId=42        → Details modal open
/cities/:cityId/notes?modal=edit&noteId=42           → Edit modal open
*                                                    → NotFoundPage
```

**Why so few routes:** Modals as routes (sub-paths) would inflate the route tree (3 sub-routes per modal × 1 entity = 3 routes per page). Search params keep the routing flat and make every modal state deep-linkable without ceremony. Decided in grilling Round 2.

## Navigation Model

### Primary navigation
**Intentionally minimal — one nav slot.** The app has two destinations: Dashboard and Notes (per city). Notes is reached from a city in the table, not from a top-level link.

- AppHeader contains:
  - **Left:** ING logo (link to `/dashboard`)
  - **Center:** Breadcrumb when on notes view (`Dashboard › Kraków › Notes`)
  - **Right:** Utility (theme toggle, language toggle)

Maximum 1 primary nav item. There is no sidebar.

### Secondary navigation
The **Toolbar** on Dashboard is the secondary nav for the table view:
- Country select
- Year select
- City filter (search input)
- PollingIndicator + manual Refresh button (icon)

On Notes view, the secondary nav is the **NotesHeader**:
- Back to Dashboard (preserves URL state — see Flow 8)
- City name (large)
- "New note" button (primary CTA, right-aligned)

### Utility navigation
- ThemeToggle (light / dark / auto cycle)
- LanguageToggle (PL / EN)

These appear in the AppHeader on every route.

### Mobile navigation
Same primary structure — there is no hamburger because there is nothing to hide. The Toolbar stacks vertically on `<sm`, the breadcrumb truncates with ellipsis if needed, utility icons stay in the header.

## Content Hierarchy

### DashboardPage

1. **Toolbar (filters)** — *highest priority because the analyst's first action is always "narrow down to the data I care about"; without country + year there is nothing to look at.*
2. **PollingIndicator** — *immediately to the right of the toolbar; the analyst needs to trust that data is current — a stale dashboard is worse than a clearly empty one.*
3. **BarChart (maxNO2 per city)** — *fast visual gestalt; lets the analyst spot outliers before reading the table. Stays above the fold on desktop.*
4. **DataTable** — *the actual workspace. Below the chart but visually dominant by virtue of occupying the largest area.*
5. **EmptyState / ErrorState / TableSkeleton** — *replaces table + chart contextually; never hidden behind a toggle.*

### NotesPage

1. **Back navigation + city title** — *anchor: the analyst needs to know "I am looking at notes for Kraków" within 200ms of page load.*
2. **"New note" button** — *primary action; visible regardless of scroll position via sticky header or top-of-list placement.*
3. **NotesList (cards)** — *DESC by createdAt; newest first because notes are typically read in reverse chronological order ("what happened recently?").*
4. **EmptyState** — *"No notes yet — be the first to add context for this city" with the "New note" CTA repeated.*
5. **Modal overlay** — *appears above content when `?modal=…` present. Focus-trapped; rest of page inert.*

### Modal content priority (NewNoteModal / EditNoteModal)
1. Title input (NewNote only; readonly in Edit)
2. Content textarea (largest visual element)
3. Inline validation errors
4. Action buttons: **Save** (primary, right), Cancel (ghost, left)
5. Loading/error feedback (replaces or accompanies actions)

### Modal content priority (DetailsNoteModal)
1. Note title
2. Created date + Modified date (subtle, side-by-side)
3. Full content (read-only, scrollable if long)
4. Close button

## User Flows

### Flow 1: First-time analyst lands on app
1. Browser opens `/` → instant redirect to `/dashboard` (no flash — react-router `<Navigate replace />`)
2. AppHeader renders; Toolbar renders with empty selects (Country select loads from `GET /api/countries`)
3. Data area shows `EmptyState: NoSelection` ("Select a country and year to begin")
4. User opens Country select (keyboard `Enter` or click); list of countries populates from cache
5. User picks "Poland" → URL becomes `/dashboard?country=PL` → Year select fetches `GET /api/countries/PL/years`
6. EmptyState text updates: "Select a year"
7. User picks 2025 → URL becomes `/dashboard?country=PL&year=2025` → TableSkeleton + BarChartSkeleton render → data fetches → fade-in (200ms)
8. PollingIndicator begins pulsing; first poll fires 20s later

### Flow 2: Apply text filter
1. User clicks city filter input (or presses `/` keyboard shortcut)
2. User types "warsz" → 300ms debounce → URL updates `?q=warsz` → Redux mirror (via listener middleware) → `selectFilteredCities` recomputes via Reselect
3. Table re-renders showing only matching cities; BarChart re-renders showing same subset
4. `aria-live="polite"` announces "Showing 1 city" (screen reader)
5. If no matches: `EmptyState: NoFilterResults` replaces table body with "Clear filter" button
6. User clears filter → URL drops `q` → full list returns

### Flow 3: Sort by column
1. User clicks `maxNO2` column header (or `Tab` to it and presses `Enter`)
2. URL updates `?sort=maxNO2:asc` → Redux mirror → Reselect sorts (nulls-last regardless of direction)
3. Arrow icon updates: `↕` → `↑`
4. `aria-sort="ascending"` on `<th>`
5. Second click: `?sort=maxNO2:desc` → `↓`
6. Third click: `?sort=city:asc` (back to default) → `↕` on the maxNO2 column

### Flow 4: Polling cycle (background)
1. Every 20s RTK Query fires `GET /api/country/PL/cities/stats/24H?year=2025`
2. PollingIndicator pulses
3. Response arrives → cache updates → Reselect detects change → table + chart re-render with new data
4. **Sort, filter, scroll position: unchanged** (none of them are part of the fetch lifecycle)
5. Rows that disappeared (sensor omission): animate out
6. New rows: animate in
7. `prefers-reduced-motion`: animations skipped, instant swap
8. On error: PollingIndicator turns red ("Failed to refresh"); retry button appears; **stale data remains visible** (don't blank the screen during a transient blip)

### Flow 5: Open notes for a city
1. User clicks city row (entire row is clickable) → navigate to `/cities/krakow/notes`
2. AppHeader breadcrumb updates: `Dashboard › Kraków › Notes`
3. NotesPage renders NotesHeader + skeleton card list
4. `GET /api/cities/krakow/notes?cursor=` fires (RTK Query infinite query) → first page loads → fade-in
5. Scroll triggers next page when sentinel intersects (intersection observer)

### Flow 6: Create a new note
1. User clicks "New note" button → URL updates `/cities/krakow/notes?modal=new`
2. Modal mounts (Radix Dialog, focus trap engages, focus moves to title input)
3. User types title (3-120 chars validated by zod) and content (1-5000 chars)
4. Save button disabled while form is invalid; helper text below each field
5. User clicks Save → button enters loading state (spinner, disabled), form disabled
6. `POST /api/cities/krakow/notes` fires
7. **Success path:**
   - Toast appears: "Note saved"
   - RTK Query invalidates `getNotes` cache → list refetches → new note appears at top (DESC by createdAt)
   - Modal closes → URL drops `?modal=new` → focus returns to "New note" button
8. **Error path:**
   - Inline error appears at top of modal: "Couldn't save note. Try again?"
   - Form values preserved
   - Save button shows "Retry"
   - User can edit and retry, or Cancel/ESC to close (confirms "Discard changes?")

### Flow 7: Edit a note
1. User clicks Edit on a NoteCard → URL `/cities/krakow/notes?modal=edit&noteId=42`
2. Modal mounts with the note's content in the textarea; title is shown read-only
3. Content editable; same validation as create
4. Save → `PATCH /api/cities/krakow/notes/42` with `{ content }`
5. Success: toast + cache update + close (URL drops `modal` and `noteId`)
6. Card on the list refreshes: same title, updated content, new `updatedAt`

### Flow 8: Share a view with a colleague
1. Analyst has applied filters: `?country=PL&year=2025&q=warsz&sort=maxNO2:desc`
2. Has clicked into Kraków notes and opened Edit on note 42 → URL is `/cities/krakow/notes?modal=edit&noteId=42`
3. Analyst copies URL from address bar, pastes in Slack
4. Colleague clicks → lands on **exactly the same view** (modal open, note loaded, form populated)
5. **Back button** in colleague's browser closes the modal → reveals notes list for Kraków
6. **Back again** → returns to Dashboard with **all filters intact** (PL, 2025, filter "warsz", sort maxNO2 desc)

### Flow 9: Recover from network error
1. User initial-loads `/dashboard?country=PL&year=2025` → fetch fails (5xx)
2. RTK Query `retry` middleware retries with exponential backoff (max 2 retries)
3. After exhausting retries: `ErrorState` replaces table + chart with "Couldn't load data" + "Try again" button + technical detail (collapsible)
4. User clicks Retry → `refetch()` fires → on success: fade-in data; on failure: same ErrorState (no retry-loop UI)
5. Polling continues in background; if a poll succeeds while ErrorState is visible, ErrorState dismisses automatically

### Flow 10: Return to Dashboard from Notes
1. User on `/cities/krakow/notes?modal=details&noteId=42`
2. Clicks "← Dashboard" in breadcrumb OR browser back button
3. Navigation pops to `/dashboard?country=PL&year=2025&q=warsz&sort=maxNO2:desc` (URL preserved)
4. RTK Query: previous data still in cache → instant render (no skeleton flash); polling resumes

## Naming Conventions

Consistency across UI, code, and i18n keys. Pick one word and use it everywhere.

| Concept | Label in UI (EN) | Label in UI (PL) | Code identifier | Notes |
|---|---|---|---|---|
| Measurement station location | City | Miasto | `city` | Not "location", "municipality", "station" |
| Country / nation | Country | Kraj | `country` | |
| Measurement year | Year | Rok | `year` | |
| Air pollutant indicator | Indicator | Wskaźnik | `indicator` | Not "metric", "value", "reading" |
| Specific measurement value | maxNO2 / maxCO / maxPM10 | Same (technical names) | Same | Keep technical names — chemists know them |
| Failed sensor reading | — (em dash) | — | `null` in data | UI displays `—` with tooltip "Sensor unavailable" |
| Text search of cities | Filter | Filtr | `cityFilter` | Not "search" — search implies fetching from server |
| Column ordering | Sort | Sortowanie | `sort` | Not "order" — order implies sequence assignment |
| Manual refresh | Refresh | Odśwież | `refresh` | Not "reload" |
| Background auto-fetch | Live | Aktywne | `polling` | UI label is "Live", code is `polling` |
| Annotation on a city | Note | Notatka | `note` | Not "comment", "annotation", "memo" |
| Note's first metadata field | Title | Tytuł | `title` | Not "subject", "heading" |
| Note's body text | Content | Treść | `content` | Not "body", "description", "text" |
| Note creation timestamp | Created | Utworzono | `createdAt` | ISO 8601 in code, relative time in UI ("3 days ago") |
| Note last-edit timestamp | Updated | Zmodyfikowano | `updatedAt` | Same |
| Read-only note view | Details | Szczegóły | `modal=details` | Not "view", "preview", "show" |
| Editable note view | Edit | Edytuj | `modal=edit` | |
| New note view | New note | Nowa notatka | `modal=new` | |
| Network/data error state | Couldn't load data | Nie udało się załadować danych | — | Apologetic but not catastrophizing; never "Error!" |
| Empty result (filter) | No matches | Brak wyników | — | |
| Empty result (no data) | No data for this selection | Brak danych dla wyboru | — | |
| Empty initial (no choice) | Select a country and year | Wybierz kraj i rok | — | |
| Save action | Save | Zapisz | — | |
| Cancel action | Cancel | Anuluj | — | |
| Retry action | Try again | Spróbuj ponownie | — | Not "Retry" — friendlier |
| Theme toggle states | Light / Dark / Auto | Jasny / Ciemny / Auto | `theme` | |
| Language toggle states | EN / PL | EN / PL | `language` | Self-labeling |

## Component Reuse Map

| Component | Used on | Behavior differences |
|---|---|---|
| **AppShell (template)** | All pages | None — wraps every route with theme provider, i18n, error boundary, header |
| **AppHeader (organism)** | All pages | Breadcrumb content differs by route; utility icons identical |
| **Toolbar (organism)** | DashboardPage only | — |
| **DataTable (organism)** | DashboardPage only | — |
| **BarChart (organism)** | DashboardPage only | — |
| **NotesList (organism)** | NotesPage only | — |
| **Modal (organism — shadcn Dialog)** | NotesPage (NewNote, Details, Edit) | Three variants share modal chrome; content swapped via `?modal=` param |
| **EmptyState (molecule)** | DashboardPage (3 variants) + NotesPage (1 variant) | Icon, copy, CTA differ per variant |
| **ErrorState (molecule)** | DashboardPage + NotesPage + each modal | Same shape; copy and retry handler injected |
| **Spinner / Skeleton** | Tables, charts, modal save buttons, list items | Sizing differs; semantics identical |
| **Button** | Everywhere | Variants: primary / secondary / ghost / destructive; `loading` state for async actions |
| **FormField** | NewNoteForm, EditNoteForm | Same component, different field configurations |
| **Toast** | Mutation success / error notifications | Top-right on desktop; bottom-center on mobile; auto-dismiss 4s |
| **ThemeToggle, LanguageToggle** | AppHeader only | — |

## Content Growth Plan

| Content type | Volume profile | IA strategy |
|---|---|---|
| **Countries** | Static, ~30 max (Europe) | Single-fetch dropdown, cached for session. No search; pickable list. |
| **Years per country** | Slow growth (1 per year) | Same — dropdown, cached. |
| **Cities per country** | Bounded (~5-50 per country) | Full list rendered in table; no pagination. Text filter handles "I want to find Warsaw fast." |
| **Measurements (snapshot)** | One row per city — bounded by city count | No pagination needed; sorting + filtering handle navigation. |
| **Notes per city** | Unbounded over time (could reach thousands) | **Infinite scroll** (cursor-based RTK Query infinite query). Newest first. Future: add date-range filter if needed (out of scope for v1). |
| **i18n strings** | Grows with features | Namespaced JSON per feature (`pl/dashboard.json`, `pl/notes.json`). |

**Anti-growth (intentional):** No accumulated time-series history in UI — only the current snapshot per `(country, year)`. Out of scope. If a future requirement adds historical comparison, IA would need a new route `/dashboard/compare?…`.

## URL Strategy

### Why URL = source of truth
- Refresh-safe
- Deep-linkable (Flow 8: copy-paste)
- Back/forward buttons work without custom code
- No "two screens, two states" — one URL maps to exactly one rendered view
- Survives the polling cycle automatically (URL is not part of fetch lifecycle)

### Patterns

**Path segments** — used for entity identity only (where am I?):
- `/dashboard` — main view
- `/cities/:cityId/notes` — notes for a specific city
- `cityId` is slug-like (lowercase, ASCII-safe, no whitespace) — provided by the API in the stats DTO

**Query parameters** — used for state, filters, and view modifiers:

| Param | Used on | Values | Default | Notes |
|---|---|---|---|---|
| `country` | `/dashboard` | ISO 3166-1 alpha-2 code (`PL`, `DE`, `FR`) | none → empty state | Drives data fetch |
| `year` | `/dashboard` | 4-digit year (`2025`) | none → empty state | Drives data fetch |
| `q` | `/dashboard` | URL-encoded string | none | City name filter; debounced 300ms before URL update |
| `sort` | `/dashboard` | `column:direction` (`city:asc`, `maxNO2:desc`) | `city:asc` (omitted from URL when default) | Single sort column |
| `modal` | `/cities/:id/notes` | `new` / `details` / `edit` | none = no modal | Open modal indicator |
| `noteId` | `/cities/:id/notes` | integer | required when `modal=details` or `modal=edit` | |

### URL construction rules

1. **Defaults are not in the URL.** `?sort=city:asc` is the default → omitted. Only non-default values appear in the URL → cleaner shareable URLs.
2. **Empty values are stripped.** `?q=` should not exist; if filter is empty, drop the param entirely.
3. **Param order is normalized** (alphabetical) on URL writes → identical state always yields identical URL → stable cache keys, easier testing.
4. **Encoding:** `encodeURIComponent` for all user-provided values (`q`, `noteId`).
5. **Invalid values are sanitized.** If URL contains `?sort=banana:asc`, sanitize to default and silently correct on next URL write (don't crash; the user pasted a bad link from somewhere).

### State Hierarchy (the "where does this live" map)

This is the **single most important decision** in this project. It is also the most-likely-to-be-asked recruiter question.

| State | Source of truth | Mirror | Local | Rationale |
|---|---|---|---|---|
| `country`, `year` | URL `?country=`, `?year=` | Redux `filtersSlice` (via listener middleware) | — | Drive fetch; shareable; survive polling and reload |
| `q` (city filter) | URL `?q=` | Redux `filtersSlice` | — | Same as above; debounce input → URL write |
| `sort` | URL `?sort=` | Redux `tableSlice` | — | Survives polling; shareable; default omitted from URL |
| `modal`, `noteId` | URL search params | Redux `notesUiSlice` | — | Deep-linkable modal state |
| `theme` (light/dark/auto) | `localStorage['theme']` | React Context (provider) | — | Persists per device; not shareable (per-user preference) |
| `language` (PL/EN) | `localStorage['language']` | i18n instance | — | Same as theme |
| Cities stats data | RTK Query cache | — | — | Server data; managed by RTK Query lifecycle |
| Countries data | RTK Query cache | — | — | Same |
| Years data | RTK Query cache | — | — | Same |
| Notes per city | RTK Query cache (infinite query) | — | — | Same |
| Form input values (NewNote, EditNote) | — | — | `useState` / react-hook-form internal | Ephemeral; cleared on close |
| Form validation errors | — | — | react-hook-form internal | Same |
| Combobox/select open/closed | — | — | Radix internal state | Same |
| Hover/focus state | — | — | CSS `:hover` / `:focus-visible` | Never JS state |
| Toast queue | — | shadcn `useToast` (in-memory provider) | — | Ephemeral, app-lifetime |
| Scroll position (notes list) | — | Browser-native | — | Restored by browser on back navigation |
| PollingIndicator "last updated" time | — | Derived from RTK Query `fulfilledTimeStamp` via Reselect | — | Computed, never stored |

**Derived (memoized via Reselect, not stored):**

```ts
selectRawCities       // from RTK Query cache for current (country, year)
selectFilters         // from Redux filtersSlice (URL mirror)
selectSortConfig      // from Redux tableSlice (URL mirror)

selectFilteredCities  = createSelector(rawCities, q, filterFn)
selectSortedCities    = createSelector(filteredCities, sort, sortFn)   // with nulls-last
selectChartData       = createSelector(sortedCities, mapToBars)
selectLastUpdated     = createSelector(fulfilledTimeStamp, toRelativeTime)
selectCityCount       = createSelector(filteredCities, arr => arr.length)
selectVisibleCityIds  = createSelector(sortedCities, arr => arr.map(c => c.cityId))
```

Every derived value above re-runs only when its inputs change by reference. Polling refresh that returns identical data → zero re-render of chart/table.

### URL ↔ Redux sync mechanism

```
┌───────────────────┐                ┌──────────────────────┐
│   address bar     │                │   Redux filtersSlice │
│   ?country=PL...  │ ◄────────────► │   { country: 'PL'... }│
└────────┬──────────┘                └──────────┬───────────┘
         │                                       │
         │ react-router useSearchParams          │ useSelector / dispatch
         ▼                                       ▼
   useSyncUrlToStore                      Components read state
   (top-level hook,                       Listener middleware
    one place)                            writes URL on action
```

**Implementation:**
1. **URL → Redux:** Top-level `<UrlSyncProvider>` watches `useSearchParams()` via `useEffect`; on change, dispatches `filtersSlice.setAllFromUrl(parsed)`. Single direction; runs once per route change.
2. **Redux → URL:** `listenerMiddleware` listens to filter actions; computes new query string; calls `navigate(`?${qs}`, { replace: true })`. `replace` (not push) to avoid spamming history with every keystroke.
3. **Initial mount:** URL parsed once → Redux hydrated → page renders with correct state.

**Why this direction (URL as truth):** Browser back/forward navigates URL → triggers URL → Redux sync naturally. The opposite (Redux as truth) requires custom history listening for back/forward — more code, more edge cases.
