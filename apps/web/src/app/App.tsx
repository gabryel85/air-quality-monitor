import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { RouteErrorFallback } from '@/components/organisms/ErrorBoundary/RouteErrorFallback';
import { ThemeProvider } from '@/features/theme/ThemeProvider';

import { router } from './router';
import { store } from './store';

export function App() {
  return (
    <ErrorBoundary FallbackComponent={RouteErrorFallback}>
      <Provider store={store}>
        <ThemeProvider>
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}
