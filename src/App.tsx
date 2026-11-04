import { RouterProvider, createBrowserRouter } from 'react-router';
import { AppProviders } from './app/providers/AppProviders';
import { routes } from './app/routes';

const router = createBrowserRouter(routes);

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
