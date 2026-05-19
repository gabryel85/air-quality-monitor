# Component Samples — Functional Confidence aesthetic

> Production-grade prototypes for the three highest-leverage components from `TASKS.md`. These are **design artifacts**, not the final implementation — copy them into `apps/web/src/components/...` (matching the Atomic Design folder structure) when implementation begins.

## What is in here

| File | Atomic level | Task ref | Aesthetic anchor |
|---|---|---|---|
| `Button.tsx` | atom | Task 9 | The ton-setter. Every other component inherits its visual language: orange accent used surgically, generous tap target, restrained radii. |
| `DataTable.tsx` | organism | Task 20 | The workspace. Sortable, nulls-aware, polling-safe, ARIA-complete. Risk-first — most domain logic in any one component. |
| `NoteModal.tsx` | organism (3 variants + router) | Task 33 | Stack demonstration — shadcn/Radix Dialog + react-hook-form + zod + URL-driven mounting + pessimistic mutation flow in one file. |
| `types.ts` | shared | — | Domain types referenced by samples (mirrors what `packages/shared-types` will export when monorepo exists). |

## Dependencies

These prototypes import from packages that don't exist yet in this empty repo. When implementation begins, install:

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-slot
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react
pnpm add react-hook-form @hookform/resolvers zod
```

Plus the standards from `TASKS.md` Task 1-2 (React, TS, Tailwind, tokens).

## Conventions

- **Tokens-only.** No hex colors, no magic numbers in component code. Every visual token comes from `tailwind.config.ts` (which maps to `tokens.css`).
- **TypeScript strict.** Every component fully typed, no `any`, no `as` casts.
- **Accessibility-first.** Radix primitives for focus trap / ARIA / keyboard. Custom components extend Radix; we never reinvent dialog or focus management.
- **Semantic HTML.** `<button>` for buttons (not `<div role="button">`), `<table>` for tabular data.
- **No comments explaining the obvious.** Identifiers do the explaining. Comments only when *why* is non-obvious (a workaround, a subtle invariant).
- **The `cn` helper.** All components use `cn(...args)` from `lib/utils` to merge Tailwind classes safely (`clsx` + `tailwind-merge`). Definition included in `types.ts` placeholder.

## What each sample demonstrates

### Button.tsx — *Aesthetic anchor*
- `cva` (class-variance-authority) for variant typing — the shadcn pattern
- 4 variants × 3 sizes × loading state, all typed exhaustively
- Focus ring uses `shadow-focus` token (3px orange ring) — not CSS outline
- Loading state preserves width (prevents layout shift)
- `asChild` prop via Radix `Slot` for polymorphic rendering (`<Button asChild><Link to="/">…</Link></Button>`)

### DataTable.tsx — *The workspace*
- Generic-friendly types (`<Row>`, `<Col>`)
- **Nulls-last sort** (the `sortWithNullsLast` utility — extract to `lib/sort.ts` later, included inline here)
- `aria-sort="ascending|descending|none"` on `<th>`
- Sortable headers are `<button>` inside `<th>` (correct ARIA: header is sortable, click target is button)
- Keyboard: `Enter` / `Space` on header button cycles sort
- Null cells: `—` in `text-ink-tertiary` + `<abbr title="…">` for tooltip (native, no JS)
- Sticky header (`<thead class="sticky top-0">`)
- Density variant prop (compact / normal)
- `tabular-nums` class on numeric cells

### NoteModal.tsx — *Stack showcase*
- `NoteModalRouter` reads `useSearchParams()` and conditionally mounts one of three modals
- `NewNoteModal` — full form, zod validation, pessimistic save
- `NoteDetailsModal` — read-only view
- `EditNoteModal` — title shown as `<output>` (read-only by spec), content editable
- Save button shows `Spinner` during pending state, disabled while invalid
- Error inline above form (form values preserved on failure)
- ESC + click-outside + Save success all close via URL update (`setSearchParams` without `modal`/`noteId`)
- Dirty-form close confirmation hooked via `onOpenChange`

## How to use these in implementation

1. Initialize the project (Tasks 1-8 from `TASKS.md`).
2. Copy `tokens.css` → `apps/web/src/styles/tokens.css`.
3. Copy `tailwind.config.ts` → `apps/web/tailwind.config.ts`.
4. Install shadcn/ui (`pnpm dlx shadcn@latest init`) so `lib/utils.ts` (with `cn`) and base UI scaffolding exist.
5. Copy each sample into its Atomic Design folder:
   - `Button.tsx` → `src/components/atoms/Button/Button.tsx`
   - `DataTable.tsx` → `src/components/organisms/DataTable/DataTable.tsx`
   - `NoteModal.tsx` → `src/features/notes/components/NoteModal.tsx`
6. Wire to data sources (RTK Query hooks from Tasks 25, 29, 30).
7. Add Storybook stories (Task 44).
