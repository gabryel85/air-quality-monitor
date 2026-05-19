/**
 * MSW node-side server for vitest. Wired in setup.ts to start before tests,
 * reset handlers between tests (isolation), and stop after the suite.
 */

import { setupServer } from 'msw/node';

import { handlers } from '@/mocks/handlers';

export const server = setupServer(...handlers);
