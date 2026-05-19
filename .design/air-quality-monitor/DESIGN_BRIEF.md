# Design Brief: Air Quality Monitor

> Portfolio-grade recruitment task. ING-branded analytics workspace for air quality measurement data across European cities.

## Problem

An air quality analyst sits in front of a screen for eight hours a day, scanning telemetry from thousands of measurement stations across Europe. They need to spot anomalies, compare cities, and add contextual notes ("Kraków spike on March 2 — confirmed traffic incident, see PIM-4521") that they can share with colleagues by sending a link.

The friction points that derail their day:

- Dashboards that **silently re-order rows** when fresh data arrives, breaking the mental map they just built
- Auto-refresh that **wipes the current filter and sort**, forcing them to set the view up again every 20 seconds
- Sensor failures hidden as "no data" — they need to know **which sensor is down**, not be told the city doesn't exist
- Charts that show "everything in the database" while the table shows a filtered view — **two truths on one screen**
- No way to share a specific view ("look at Silesian cities, sorted by PM10") — they end up writing instructions in Slack

## Solution

A predictable, link-shareable workspace where every action the analyst takes — selecting a country, picking a year, typing a filter, clicking a sort header, opening a note — is reflected in the URL. The interface treats sensor failures as first-class information (null is rendered, never hidden), preserves user context across the 20-second polling cycle, and keeps chart and table in lockstep so they always tell the same story.

Notes are one click away from any row, deep-linkable down to the individual note modal, so an analyst can paste `…/cities/krakow/notes?modal=edit&noteId=42` into a chat and a colleague lands exactly where they were.

## Experience Principles

1. **Predictable over fancy** — No surprise re-orderings, no flash-of-loading, no hidden state. Every user action has a deterministic, visible result. *Resolves tension between modern UI polish and the deterministic muscle memory power-users build over eight-hour shifts.*

2. **Failures are first-class** — Null values, network errors, missing data, and 0-result filters are not edge cases to hide; they are scenarios to design. Render them, sort them sensibly (nulls-last), narrate them clearly. *Resolves tension between visual cleanliness and analytical honesty.*

3. **The URL is the memory** — Every meaningful piece of state — filter, sort, year, country, open modal — is in the URL. The browser back button works. Sharing a view is "copy address bar." *Resolves tension between implementation simplicity and collaborative power.*

## Aesthetic Direction

- **Philosophy**: **Functional Confidence** — restrained, data-dense, instrument-like. Closer to Bloomberg Terminal or Linear than a consumer SaaS dashboard. White space used for hierarchy, not "breathing room." Type small but readable. Tables get visual priority because they are the workspace.
- **Tone**: Professional, competent, calm. Never alarming. Data speaks for itself; the chrome stays out of the way. ING orange is a navigational accent (focus rings, primary CTAs, active sort indicators), never a decoration.
- **Reference points**:
  - **Linear** — clarity, density, opinionated keyboard support
  - **Vercel dashboard** — modern restraint, monochrome + one accent
  - **Datadog** — data density done right
  - **ing.com** — brand presence: orange + navy on near-white, sans-serif, generous corner radii (~6-10px)
- **Anti-references**:
  - Consumer SaaS with gradient hero backgrounds
  - "Dashboard-as-art" with oversized numbers and emoji indicators
  - Neumorphism / glassmorphism — too playful for a professional tool
  - Material Design — feels too "Google product"

## Existing Patterns

Greenfield project — no existing CSS variables, components, or design tokens to respect. Everything will be established in Phase 4 (Design Tokens) and used as the canonical reference from there on.

- **Typography**: TBD in tokens phase — leaning toward Inter (UI) + JetBrains Mono (numeric tabular columns, latitudes, sensor IDs)
- **Colors**: TBD — ING orange (#FF6200) as primary accent, near-black/near-white base, neutral grays for data, semantic colors for status (sensor up/down, error, success)
- **Spacing**: TBD — 4px base unit, tight scale (4/8/12/16/24/32/48/64/96)
- **Components**: shadcn/ui as the base layer (Radix primitives — focus traps, ARIA, keyboard nav for free); custom styling for data-specific organisms (DataTable, BarChart, NoteCard)

## Component Inventory

| Component | Status | Notes |
|---|---|---|
| **Atoms** | | |
| Button | New (shadcn) | variants: primary / secondary / ghost / destructive; sizes: sm / md / lg; loading state |
| Input | New (shadcn) | text + search variant with leading icon |
| Label | New (shadcn) | associated with form controls |
| Badge | New | sensor status (online / offline / partial) |
| Spinner | New | sizes sm/md/lg, screen-reader text |
| Icon | New (lucide-react) | consistent stroke/size system |
| Skeleton | New | shimmer placeholder primitive |
| Kbd | New | keyboard shortcut display (`Esc`, `↵`) in modal hints |
| **Molecules** | | |
| FormField | New | label + input + helper text + error message |
| Select | New (shadcn) | country / year dropdowns, keyboard nav |
| SearchInput | New | input + leading icon + clear button + debounce hook |
| ToolbarItem | New | label + control grouping |
| ThemeToggle | New | light / dark / auto cycle with icons |
| LanguageToggle | New | PL / EN switch with flag or text |
| EmptyState | New | 3 variants: NoSelection, NoData, NoFilterResults — each with icon + title + body + CTA |
| ErrorState | New | error message + retry button + technical detail (collapsible) |
| PollingIndicator | New | small pulsing dot + last-updated timestamp |
| Toast | New (shadcn) | success / error notifications |
| **Organisms** | | |
| DataTable | New | sortable headers, sticky header, hover row, null cells, density variants, aria-sort, keyboard nav |
| TableSkeleton | New | 7 placeholder rows preserving column widths |
| BarChart | New (visx) | custom ING-themed bars, tooltip, animated transitions on data change, axis labels, accessible `<table>` alt for SR |
| BarChartSkeleton | New | placeholder bars |
| NoteCard | New | title + dates + Details/Edit actions, hover state |
| NotesListInfinite | New | RTK Query infinite scroll, intersection observer sentinel |
| Modal | New (shadcn Dialog) | wraps Radix, custom sizing, mobile full-screen |
| NoteModal | New (3 variants) | NewNoteForm / NoteDetailsView / EditNoteForm — all URL-driven via `?modal=…&noteId=…` |
| Toolbar | New | filters row: country / year / city filter / refresh status |
| AppHeader | New | logo + nav + theme/language toggles |
| ErrorBoundary | New (react-error-boundary) | per-route + global fallback |
| **Templates** | | |
| AppShell | New | header + main + theme provider + i18n + error boundary |
| DashboardLayout | New | toolbar + chart + table grid |
| NotesLayout | New | back nav + city title + actions bar + scrollable list |
| **Pages** | | |
| DashboardPage | New | composition of Toolbar + BarChart + DataTable |
| NotesPage | New | composition of NotesLayout + NotesListInfinite + NoteModal |
| NotFoundPage | New | 404 with link home |

## Key Interactions

### Initial dashboard load
1. User lands on `/` → no country/year selected
2. Country list fetches in background (RTK Query) → Country select populates
3. EmptyState "Select a country and year" centers in the data area (chart + table region)
4. User picks country → Year select populates from `countries/:id/years` → still EmptyState
5. User picks year → URL updates `?country=PL&year=2025` → skeleton appears in chart + table → data arrives → fade-in (200ms)

### Polling refresh (every 20s)
- Subtle pulsing dot in toolbar ("Live · updated 12s ago") — uses `relativeTime` formatter
- No layout shift, no flash, no scroll reset
- Sort, filter, scroll position all preserved (filter/sort live in URL + Redux mirror, not in fetch cycle)
- If a row disappears (sensor outage caused omission), it animates out with `opacity 0` + `height 0` (300ms) — opt-out via `prefers-reduced-motion`
- New rows fade in (200ms)

### Filter change (country or year)
- Skeleton replaces table + chart (context-switch — analyst must know "I'm looking at different data now")
- Old cache kept for instant return if user picks the previous country again
- URL updates immediately on selection; query fires from URL change

### Sort header click
- States cycle: unsorted → ascending → descending → unsorted (back to default `city ASC`)
- Arrow icon updates: `↕` (off) / `↑` (asc) / `↓` (desc)
- `aria-sort="ascending|descending|none"` on `<th>`
- Nulls always sink to the bottom regardless of direction — annotated in tooltip on column header (i)
- Sort is in URL `?sort=maxNO2:desc` → survives refresh and polling

### City filter (text)
- Debounced 300ms before URL update
- Empty filter = show all
- 0 results = `NoFilterResults` empty state with "Clear filter" button
- Chart re-renders in sync (only filtered cities appear as bars)
- Aria-live: "Showing N cities" announced when filter changes

### Null cell rendering
- Display `—` (em dash) in `text-neutral-400`
- Hover/focus tooltip: "Sensor unavailable for this measurement"
- Bar chart: no bar drawn for that city (gap), label still shown on axis with `—` mark

### Open notes for a city
- Two affordances: full row clickable + explicit "Notes" icon button per row
- Navigate to `/cities/:cityId/notes`
- Notes list loads (skeleton cards) → fade-in
- Back navigation returns to dashboard with **all filters preserved** (URL is source of truth)

### New note flow
1. Click "New note" → URL updates `?modal=new` → modal opens with focus on title input
2. User types title and content → real-time inline validation (zod) → Save button disabled if invalid
3. Click Save → button → spinner + disable form → POST → success: toast "Note saved" + close modal + list invalidates and refetches
4. Failure: inline error message above form + Retry button (form stays open with values preserved)
5. ESC closes modal; if form is dirty, confirm "Discard changes?" before close

### Edit note flow
1. Click Edit on a card → `?modal=edit&noteId=42` → modal opens with content textarea focused (title is read-only, per spec)
2. Same save/retry semantics as New
3. Success: card updates with new content + new `updatedAt` timestamp

### Details modal
- `?modal=details&noteId=42` → read-only view of title, dates, full content
- Single close button

### Theme toggle
- Cycles light → dark → auto → light
- Stored in localStorage; `auto` follows `prefers-color-scheme`
- Theme transition: 200ms ease on background + text colors only (not borders, to avoid jank)

### Keyboard
- `/` focuses city filter input (Linear-style)
- `Esc` closes any open modal
- `Tab` traverses focus naturally; `Shift+Tab` reverses
- Sort headers focusable; `Enter` or `Space` cycles direction
- Theme toggle `T`, language `L` (optional, document in `?` help)

## Responsive Behavior

### Breakpoints
- **Mobile**: < 640px (`sm`)
- **Tablet**: 640-1023px (`md`)
- **Desktop**: 1024-1439px (`lg`)
- **Wide**: ≥ 1440px (`xl`)

### Dashboard
| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Toolbar | Stacked vertically: country, year, filter on separate rows | 2 rows: country+year, then filter | Single row, inline |
| BarChart | Horizontal scroll (sticky y-axis) or compressed bars; height ~200px | Above table, full-width; height ~280px | Above table, full-width; height ~320px |
| DataTable | Card list (each row → card with `label: value` rows) | Standard table, horizontal scroll if needed | Standard table, no scroll |
| PollingIndicator | Compact dot only | Dot + relative time | Dot + relative time + "Live" label |

### Notes
| Element | Mobile | Tablet+ |
|---|---|---|
| List | Single column, full-width cards | Single column, max-width 720px, centered |
| Modal | Full-screen, slides up | Centered, max-width 540px, fade+scale |
| NoteCard | Stacked metadata (title, date columns wrap) | Inline metadata row |

## Accessibility Requirements

### Contrast (WCAG AA)
- Text vs background: ≥ 4.5:1 for body (≥ 3:1 for large text 18pt+ bold)
- UI elements (buttons, borders, focus rings): ≥ 3:1
- Tokens phase will validate every color pair in light + dark

### Keyboard
- Every interactive element reachable via `Tab`
- Focus visible at all times — custom `:focus-visible` ring in `ing-orange-500` (3px, offset 2px)
- Sort headers: `Enter`/`Space` cycle direction
- Modal: focus trapped inside, returns to trigger on close
- `Esc` closes modals and dropdowns
- Skip-link `Skip to main content` as first focusable element

### Screen reader
- Semantic HTML: `<table>`, `<th>`, `<button>` (not divs styled as buttons)
- `aria-sort` on column headers
- `aria-live="polite"` for loading announcements ("Loading data", "N cities loaded")
- `role="alert"` for critical errors (network failure)
- BarChart includes visually-hidden `<table>` summary as text alternative
- Form errors announced via `aria-describedby` on inputs
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title

### Motion
- All animations respect `prefers-reduced-motion: reduce` → instant transitions
- No auto-playing animations beyond data-driven fades (polling row in/out)

### Color independence
- Status never communicated by color alone — paired with icon or label
- Sort direction: icon + `aria-sort`, not just color

### Audit
- `axe-core` integrated into RTL test suite
- Manual keyboard-only walkthrough as part of pre-commit checklist
- Color-blind safe palette validation in tokens phase

## Out of Scope

This brief explicitly **does not cover**:

- **Authentication / authorization** — single anonymous workspace
- **Real-time updates** — polling only (PDF explicitly excludes WebSocket/SSE)
- **Historical time-series chart** — only "snapshot per year" as specified
- **Export to CSV / PDF** — no spec requirement
- **Multi-country comparison view** — single country at a time
- **Map view / geospatial visualization** — out of scope
- **Mobile native apps** — responsive web only
- **Print stylesheets** — not requested
- **Email / Slack / push notifications** — no notification layer
- **User profiles, preferences sync across devices** — localStorage only for theme/language
- **Notes sharing permissions** — all notes visible to all users (no ACL)
- **Rich text in notes** — plain text only (no Markdown, no formatting toolbar)
- **Attachment uploads in notes** — text-only
- **Pagination controls** for notes — infinite scroll only
- **Sensor health dashboard** — null is communicated inline; no dedicated view
- **Data corrections / edits** — read-only telemetry
- **Audit log** — no history of who-changed-what for notes

## Success Criteria

The brief is successful if, after implementation, the following statements are true:

1. An analyst can change country, year, sort, filter, and open a note modal — **then refresh the browser and land on the exact same view**.
2. Polling never disrupts the analyst's current context: filter, sort, scroll, and any open modal survive a refetch.
3. Sensor failures (null values, omitted rows) are visible and communicated, not hidden.
4. A colleague can be sent a URL and land on the exact same view, including an open note modal.
5. The interface passes WCAG AA contrast and is fully keyboard-operable.
6. ING brand identity is recognizable (orange accent, navy tones, typography) without overwhelming the data.
7. Light/dark/auto theme transitions cleanly and remembers preference.
8. Initial load shows skeleton states; subsequent polls show data without flash.
9. Errors offer a retry path on every fetch (initial, poll, mutation).
10. The codebase is comprehensible to a senior FE engineer in under 15 minutes of exploration.
