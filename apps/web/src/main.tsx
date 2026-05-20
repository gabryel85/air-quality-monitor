// Font assets — variable Inter (UI) + JetBrains Mono (numeric/tabular)
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

// Design tokens (CSS variables) + Tailwind base/components/utilities
import './styles/tokens.css';

// i18n bootstrap (must run before any component reads from t())
import './i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { ensureSeeded } from './mocks/notesDb';

/** Minimum time the boot splash stays visible — avoids a jarring flash. */
const MIN_SPLASH_MS = 700;

/**
 * Boot sequence:
 *   1. Start MSW worker (no real backend yet — every /api/* is mocked).
 *   2. Seed the IndexedDB notes store on first visit (notesDb.ensureSeeded).
 *   3. Mount React — this replaces the boot splash declared in index.html.
 *
 * Mocks run in BOTH dev and production builds. The PDF doesn't require a real
 * backend and Vercel deploys MSW happily — see DESIGN_TOKENS.md and README.
 */
async function bootstrap(): Promise<void> {
  const startedAt = performance.now();

  const { enableMocks } = await import('./mocks/browser');
  await Promise.all([
    enableMocks(),
    // A failed seed must not block the mount — the notes view detects the
    // storage failure and offers a one-click reset.
    ensureSeeded().catch(() => undefined),
  ]);

  const elapsed = performance.now() - startedAt;
  if (elapsed < MIN_SPLASH_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS - elapsed));
  }

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element #root not found');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
