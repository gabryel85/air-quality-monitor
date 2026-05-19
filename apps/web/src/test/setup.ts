import '@testing-library/jest-dom/vitest';

import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

import { server } from './server';

// vitest-axe assertion matchers
expect.extend(axeMatchers);

// MSW lifecycle for integration tests.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
