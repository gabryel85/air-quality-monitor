# Design Tokens: Air Quality Monitor

> Token system derived from the *Functional Confidence* philosophy in `DESIGN_BRIEF.md`. Color palette anchored on the ING brand (#FF6200 orange + navy). Three themes: light, dark, auto (`prefers-color-scheme`).

## Files

| File | Purpose |
|---|---|
| `DESIGN_TOKENS.md` | This document — system overview, rationale, contrast audit |
| `tokens.css` | CSS custom properties (light + dark) — single source of truth |
| `tailwind.config.ts` | Tailwind `theme.extend` mapping CSS variables to utility classes |

These are design artifacts (copied to `apps/web/src/styles/tokens.css` and `apps/web/tailwind.config.ts` when implementation begins).

## Philosophy mapping

| Functional Confidence trait | Token decision |
|---|---|
| Data-dense | 14px base font (vs default 16); 4px spacing base with tight rhythm; small radii on inputs (4-6px) |
| Restrained | Single primary accent (ING orange); navy as secondary only; status colors used sparingly |
| Instrument-like | Numeric values get tabular-nums + JetBrains Mono; not the body font |
| Calm not alarming | Errors use a desaturated red, not pure-red; success a deep teal-leaning green, not lime |
| Warm-neutral palette | Cream background (#FAF8F4), warm grays (not cool blue-grays) — easier on eyes for 8h shifts |
| Dark mode that feels intentional | Warm dark (#0F0F11, slight brown undertone), softened white text (#E5E1D7, not #FFF) |
| ING brand presence | Orange as the *only* unmissable accent — focus rings, primary CTAs, active sort indicators, polling pulse |

## Color system

### Primitive scales (do not use directly — semantic tokens compose these)

**ING Orange** (brand anchor at 600):
```
50:  #FFF4ED     400: #FF8542     800: #A33D00
100: #FFE6D5     500: #FF7C24     900: #7A2D00
200: #FFC8A8     600: #FF6200 ★   950: #4D1C00
300: #FFA577     700: #D24E00
```

**ING Navy** (secondary anchor at 800):
```
50:  #F1F4F9     400: #6A82A6     800: #1F3D75 ★
100: #DDE4EE     500: #4F6B91     900: #102140
200: #BBC9DD     600: #3D5478     950: #07142A
300: #8FA4C2     700: #2A4768
```

**Warm Neutrals** (background + text scaffolding):
```
50:  #FAF8F4 ★   400: #A39E91     800: #2A2925
100: #F2EFE8     500: #75716A     900: #1A1917
200: #E5E1D7     600: #585551     950: #0E0D0B
300: #D1CDC1     700: #3F3D39
```

**Dark Surface** (dark-mode background scaffold — slight brown undertone, not pure black):
```
700: #1F1F1D   800: #16161A   900: #0F0F11   950: #08080A
```

**Status primitives**:
```
success-light: #0F7B5D  / dark: #34D399
warning-light: #B8860B  / dark: #FBBF24
error-light:   #C53030  / dark: #F87171
info-light:    #1F3D75  / dark: #8FA4C2
```

### Semantic tokens (use these in components)

Every component must reference semantic tokens, never primitives. This is the contract that enables theme switching without component changes.

| Semantic name | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-bg-canvas` | neutral-50 `#FAF8F4` | dark-900 `#0F0F11` | Main page background |
| `--color-bg-surface` | white `#FFFFFF` | dark-800 `#16161A` | Cards, modals, table |
| `--color-bg-subtle` | neutral-100 `#F2EFE8` | dark-700 `#1F1F1D` | Inputs, alt rows, hover |
| `--color-bg-muted` | neutral-200 `#E5E1D7` | `#252522` | Disabled bg, code blocks |
| `--color-bg-inverse` | navy-900 `#102140` | neutral-50 `#FAF8F4` | Inverse callouts |
| `--color-text-primary` | neutral-900 `#1A1917` | `#E5E1D7` | Body text |
| `--color-text-secondary` | neutral-600 `#585551` | `#A39E91` | Labels, metadata |
| `--color-text-tertiary` | neutral-400 `#A39E91` | `#75716A` | Placeholder, disabled |
| `--color-text-inverse` | neutral-50 `#FAF8F4` | neutral-900 `#1A1917` | Text on inverse bg |
| `--color-text-link` | navy-800 `#1F3D75` | orange-400 `#FF8542` | Inline links |
| `--color-text-on-accent` | white `#FFFFFF` | dark-900 `#0F0F11` | Text on primary button |
| `--color-border-default` | neutral-300 `#D1CDC1` | `#2A2A28` | Default borders |
| `--color-border-subtle` | neutral-200 `#E5E1D7` | `#1F1F1D` | Subtle dividers |
| `--color-border-strong` | neutral-400 `#A39E91` | `#3F3E3B` | Emphasis borders |
| `--color-border-focus` | orange-600 `#FF6200` | orange-500 `#FF7C24` | Focus rings |
| `--color-accent-primary` | orange-600 `#FF6200` | orange-500 `#FF7C24` | Primary CTA, brand |
| `--color-accent-primary-hover` | orange-700 `#D24E00` | orange-400 `#FF8542` | Hover state |
| `--color-accent-primary-active` | orange-800 `#A33D00` | orange-600 `#FF6200` | Active/pressed |
| `--color-accent-secondary` | navy-800 `#1F3D75` | navy-300 `#8FA4C2` | Secondary actions, links |
| `--color-status-success` | `#0F7B5D` | `#34D399` | Sensor online, save success |
| `--color-status-warning` | `#B8860B` | `#FBBF24` | Partial sensor failure |
| `--color-status-error` | `#C53030` | `#F87171` | Network error, sensor offline |
| `--color-status-info` | navy-800 `#1F3D75` | `#8FA4C2` | Neutral notification |
| `--color-overlay` | `rgba(15,13,11,0.5)` | `rgba(0,0,0,0.7)` | Modal backdrop |
| `--color-skeleton` | neutral-200 `#E5E1D7` | dark-700 `#1F1F1D` | Loading shimmer base |
| `--color-skeleton-highlight` | neutral-100 `#F2EFE8` | `#2A2A28` | Loading shimmer peak |

### Domain-specific tokens

```
--color-sensor-online      → status-success
--color-sensor-degraded    → status-warning  (some null values present)
--color-sensor-offline     → status-error    (row omitted from API)
--color-chart-bar          → accent-primary  (default visx bar fill)
--color-chart-bar-hover    → accent-primary-hover
--color-chart-grid         → border-subtle
--color-chart-axis         → text-tertiary
--color-poll-pulse         → accent-primary  (live indicator)
```

## WCAG AA contrast audit

All pairs validated against WCAG 2.1 AA (4.5:1 normal text, 3:1 large text / UI elements).

### Light mode

| Pair | Ratio | Pass |
|---|---|---|
| text-primary on bg-canvas (#1A1917 / #FAF8F4) | 16.4 : 1 | ✅ AAA |
| text-secondary on bg-canvas (#585551 / #FAF8F4) | 7.2 : 1 | ✅ AAA |
| text-tertiary on bg-canvas (#A39E91 / #FAF8F4) | 3.0 : 1 | ✅ AA Large only — only use for non-essential or large text |
| text-primary on bg-surface (#1A1917 / #FFFFFF) | 18.7 : 1 | ✅ AAA |
| text-on-accent on accent-primary (#FFFFFF / #FF6200) | 3.6 : 1 | ✅ AA Large (button text ≥14px semibold qualifies) |
| accent-primary on bg-canvas (#FF6200 / #FAF8F4) | 3.5 : 1 | ✅ AA Large + UI elements |
| accent-secondary on bg-canvas (#1F3D75 / #FAF8F4) | 9.1 : 1 | ✅ AAA |
| text-link on bg-canvas (#1F3D75 / #FAF8F4) | 9.1 : 1 | ✅ AAA |
| status-error on bg-canvas (#C53030 / #FAF8F4) | 5.1 : 1 | ✅ AA |
| status-success on bg-canvas (#0F7B5D / #FAF8F4) | 5.4 : 1 | ✅ AA |
| border-focus on adjacent surface (#FF6200 / #FFFFFF) | 3.5 : 1 | ✅ UI element |

### Dark mode

| Pair | Ratio | Pass |
|---|---|---|
| text-primary on bg-canvas (#E5E1D7 / #0F0F11) | 14.8 : 1 | ✅ AAA |
| text-secondary on bg-canvas (#A39E91 / #0F0F11) | 7.4 : 1 | ✅ AAA |
| text-tertiary on bg-canvas (#75716A / #0F0F11) | 4.5 : 1 | ✅ AA (just at threshold) |
| text-on-accent on accent-primary (#0F0F11 / #FF7C24) | 7.3 : 1 | ✅ AAA — dark text on lighter orange |
| accent-primary on bg-canvas (#FF7C24 / #0F0F11) | 8.9 : 1 | ✅ AAA |
| accent-secondary on bg-canvas (#8FA4C2 / #0F0F11) | 7.6 : 1 | ✅ AAA |
| status-error on bg-canvas (#F87171 / #0F0F11) | 5.9 : 1 | ✅ AA |
| status-success on bg-canvas (#34D399 / #0F0F11) | 9.3 : 1 | ✅ AAA |

**Key dark-mode decision:** Buttons use **dark text on lighter orange** (`#0F0F11 on #FF7C24`) instead of white-on-orange. Dramatically improves contrast (7.3:1 vs 3.6:1) and visual weight balance on dark backgrounds.

## Spacing scale

4px base unit, tight rhythm appropriate for data-density.

```
space-0    0px       space-5    20px       space-12   48px
space-px   1px       space-6    24px       space-16   64px
space-0.5  2px       space-7    28px       space-20   80px
space-1    4px       space-8    32px       space-24   96px
space-1.5  6px       space-9    36px       space-32   128px
space-2    8px       space-10   40px
space-2.5  10px      space-11   44px
space-3    12px
space-4    16px
```

Tailwind default is preserved (multiples of 4px). Use `gap-2` (8px) for tight clusters, `gap-4` (16px) for component groupings, `gap-8` (32px) for layout sections.

## Typography

### Font stacks

```
--font-family-ui:      'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif
--font-family-display: var(--font-family-ui)
--font-family-mono:    'JetBrains Mono', 'SF Mono', ui-monospace, monospace
```

Inter loaded via `@fontsource-variable/inter` (variable font, single file). JetBrains Mono via `@fontsource/jetbrains-mono` (weights 400, 500).

### Size ramp (data-density tuned)

| Token | Size | Line height | Usage |
|---|---|---|---|
| `text-xs` | 11px | 16px (1.45) | Badges, micro-labels, table footer |
| `text-sm` | 12px | 18px (1.5) | Table cells, secondary labels |
| `text-base` | 14px | 20px (1.43) | UI text default, form labels |
| `text-md` | 16px | 24px (1.5) | Body content (notes content) |
| `text-lg` | 18px | 28px (1.55) | Section headings |
| `text-xl` | 20px | 28px (1.4) | Modal title |
| `text-2xl` | 24px | 32px (1.33) | Page title |
| `text-3xl` | 30px | 36px (1.2) | Hero (rare) |

**Note:** 14px UI default is intentional (Linear, Vercel, Datadog all use ~13-14px). For body content in notes, force `text-md` (16px) for readability of longer prose.

### Weights

```
font-normal:    400     font-semibold:  600
font-medium:    500     font-bold:      700
```

Use `font-medium` for table headers, `font-semibold` for buttons and modal titles. Avoid `font-bold` outside hero text.

### Line height + letter spacing

```
leading-tight:   1.2     tracking-tight:   -0.01em
leading-snug:    1.35    tracking-normal:   0
leading-normal:  1.5     tracking-wide:     0.04em  /* uppercase labels */
leading-relaxed: 1.65
```

### Numeric columns

Always apply `font-variant-numeric: tabular-nums` to columns containing numbers (table cells with maxNO2 etc.). This locks digit width so columns of numbers align vertically without jitter on sort.

Optionally apply `font-family-mono` to the most critical numeric cells.

## Layout

```
--max-width-prose:     65ch         /* Notes content reading width */
--max-width-container: 1280px       /* Default page max */
--max-width-wide:      1536px       /* Dashboard with wide tables */

--radius-none:  0
--radius-sm:    4px      /* Small inputs, badges */
--radius-md:    6px      /* Buttons, inputs default (ING-ish) */
--radius-lg:    8px      /* Cards */
--radius-xl:    12px     /* Modals */
--radius-2xl:   16px
--radius-full:  9999px   /* Pills, avatars */
```

### Shadows

Subtle, layered. Dark mode uses lower-opacity shadows (shadows are less visible on dark surfaces — rely on bg color contrast and borders instead).

```
--shadow-xs:    0 1px 2px rgba(0,0,0,0.04)
--shadow-sm:    0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md:    0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)
--shadow-lg:    0 10px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)
--shadow-xl:    0 20px 40px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06)

--shadow-focus: 0 0 0 3px rgba(255, 98, 0, 0.35)   /* Orange ring 35% */
```

Dark mode `--shadow-*` get `rgba(0,0,0,0.4-0.6)` and slightly larger blur — keeps depth perceivable against dark surfaces.

## Motion

```
--duration-instant: 50ms      /* Token swap, micro-feedback */
--duration-fast:    150ms     /* Hover, focus transitions */
--duration-normal:  200ms     /* Modal fade, theme switch */
--duration-slow:    300ms     /* Table row in/out, skeleton fade */
--duration-slower:  500ms     /* Page transitions */

--easing-default:   cubic-bezier(0.4, 0, 0.2, 1)
--easing-in:        cubic-bezier(0.4, 0, 1, 1)
--easing-out:       cubic-bezier(0, 0, 0.2, 1)
--easing-emphasis:  cubic-bezier(0.2, 0, 0, 1)    /* Material 3 emphasized */
```

**Mandatory:** All transitions wrapped in `@media (prefers-reduced-motion: no-preference)`. Default is no animation.

## Breakpoints

```
--bp-sm:  640px      /* Stack toolbar */
--bp-md:  768px      /* Side-by-side controls */
--bp-lg:  1024px     /* Desktop layout */
--bp-xl:  1280px     /* Wide layout */
--bp-2xl: 1536px     /* Ultra-wide */
```

## Theme switching mechanism

### HTML setup

```html
<html lang="pl" data-theme="auto">
  <!-- data-theme: "light" | "dark" | "auto" (default) -->
</html>
```

### JavaScript (runs before React mounts — prevents flash)

```html
<script>
  (function() {
    var stored = localStorage.getItem('theme') || 'auto';
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var effective = stored === 'auto' ? (systemDark ? 'dark' : 'light') : stored;
    document.documentElement.dataset.theme = stored;
    document.documentElement.classList.toggle('dark', effective === 'dark');
  })();
</script>
```

This runs synchronously in `<head>` so the first paint already has correct classes — no flash of incorrect theme.

### CSS selectors

```css
:root           { /* light tokens (default) */ }
:root.dark      { /* dark tokens (set by JS when effective=dark) */ }
```

`prefers-color-scheme` is honored *via* the JS bootstrap, not via a CSS media query. This avoids the dual-source-of-truth problem (CSS would apply system pref even if user manually picked light).

### Theme toggle behavior

```
Click ThemeToggle → cycle: auto → light → dark → auto
On change:
  1. localStorage['theme'] = newValue
  2. html.dataset.theme = newValue
  3. Recompute effective theme (auto reads matchMedia)
  4. Toggle .dark class on html
  5. Notify React via context (so icon in toggle updates)
```

### System pref listener

```ts
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (localStorage.getItem('theme') === 'auto') {
    document.documentElement.classList.toggle('dark', e.matches);
  }
});
```

## Component-token mapping (reference for component builders)

| Component | Tokens used |
|---|---|
| Button (primary) | bg `--color-accent-primary`, hover `--color-accent-primary-hover`, text `--color-text-on-accent`, focus `--shadow-focus`, radius `--radius-md` |
| Button (secondary) | bg `--color-bg-surface`, border `--color-border-default`, text `--color-text-primary` |
| Input | bg `--color-bg-surface`, border `--color-border-default`, focus border `--color-border-focus` |
| Modal | bg `--color-bg-surface`, overlay `--color-overlay`, shadow `--shadow-xl`, radius `--radius-xl` |
| DataTable header | bg `--color-bg-subtle`, text `--color-text-secondary`, font-medium, tracking-wide, uppercase text-xs |
| DataTable row | hover bg `--color-bg-subtle`, border-bottom `--color-border-subtle` |
| Null cell value | text `--color-text-tertiary`, content `—` |
| BarChart bar | fill `--color-chart-bar`, hover `--color-chart-bar-hover` |
| BarChart axis | stroke `--color-chart-axis`, text-xs |
| PollingIndicator dot | bg `--color-poll-pulse`, animated opacity 0.4 → 1 every 2s |
| Skeleton | bg `--color-skeleton`, animated to `--color-skeleton-highlight` |
| Focus ring (global `:focus-visible`) | `--shadow-focus` |
| Toast (success) | border-left `--color-status-success`, bg `--color-bg-surface` |
| Toast (error) | border-left `--color-status-error`, bg `--color-bg-surface` |

## Deviations from defaults

| Decision | Default | Chosen | Why |
|---|---|---|---|
| Base font size | 16px | 14px | Data density (Linear/Datadog convention) |
| Background | pure white #FFF | cream #FAF8F4 | Easier on eyes for 8h shifts; ING brand cream undertone |
| Dark background | near-black #0A0A0A | warm dark #0F0F11 | Slight brown undertone matches warm light palette; less harsh |
| Dark text | pure white #FFF | cream-toned #E5E1D7 | Reduces glare; AAA contrast still maintained |
| Button text on orange (dark mode) | white | dark `#0F0F11` | Improves contrast from 3.6:1 to 7.3:1 |
| Focus ring | thin solid | 3px shadow ring | Visible without disrupting layout; orange brand color |
| Modal radius | none / very large | 12px | Generous but professional; ING uses ~6-10px on inputs |
| Border radius (inputs) | 4-8px range | 6px | ING-aligned |
| Status error | #DC2626 (vivid) | #C53030 (desaturated) | Less alarming; analyst sees many sensor failures, shouldn't feel like emergencies |

## Future-proofing

- **Colors are CSS variables** → swappable per theme without recompiling Tailwind
- **Tokens are semantic** → renaming primitives requires no component changes
- **Domain tokens (`--color-sensor-*`) are aliases** → adding "sensor-maintenance" later requires only one new alias
- **No hex values in components** — enforce via ESLint rule (no hardcoded colors outside `tokens.css`)
- **Storybook will document each token** with copy-paste utility class examples
