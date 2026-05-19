# `@aqm/web`

React frontend for **Air Quality Monitor**. See the project root README for setup, architecture decisions, and the design package in `.design/air-quality-monitor/`.

## Scripts

| Command          | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Start Vite dev server with MSW worker active |
| `pnpm build`     | Type-check + production build                |
| `pnpm preview`   | Serve the production build locally           |
| `pnpm lint`      | Run ESLint (`--max-warnings=0`)              |
| `pnpm typecheck` | Run TypeScript without emitting              |
| `pnpm test`      | Run Vitest in watch mode                     |
| `pnpm test:run`  | Run Vitest once                              |
| `pnpm test:e2e`  | Run Playwright E2E tests                     |
| `pnpm storybook` | Start Storybook                              |

## Stack

Vite 8 · React 19 · TypeScript 6 (max strict) · Redux Toolkit 2 + RTK Query · React Router 6 · Tailwind CSS 3 · MSW 2 · react-i18next · react-hook-form + zod
