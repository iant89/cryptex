import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { AppProviders } from '../app/providers/AppProviders';
import { routes } from '../app/routes';

/** Renders the full app (providers + routes) at a given path with an in-memory router. */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const utils = render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...utils, router };
}
