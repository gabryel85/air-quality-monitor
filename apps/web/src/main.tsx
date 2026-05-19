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

/**
 * Boot sequence:
 *   1. Start MSW worker (no real backend yet — every /api/* is mocked).
 *   2. Mount React.
 *
 * Mocks run in BOTH dev and production builds. The PDF doesn't require a real
 * backend and Vercel deploys MSW happily — see DESIGN_TOKENS.md and README.
 */
async function bootstrap(): Promise<void> {
  const { enableMocks } = await import('./mocks/browser');
  await enableMocks();

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element #root not found');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
