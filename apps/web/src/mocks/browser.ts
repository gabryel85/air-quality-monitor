import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/**
 * MSW service worker for browser. Started in dev + prod by `enableMocks()`.
 * Real backend would be wired here when one exists; until then, the worker
 * is the source of truth for /api/*.
 */
export const worker = setupWorker(...handlers);

export async function enableMocks(): Promise<void> {
  await worker.start({
    // Don't warn on unhandled requests from the dev server itself (HMR, fonts).
    onUnhandledRequest: (req, print) => {
      const url = new URL(req.url);
      if (url.pathname.startsWith('/api/')) {
        print.warning();
      }
    },
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    quiet: import.meta.env.PROD,
  });
}
