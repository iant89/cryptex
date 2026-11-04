import { Navigate, type RouteObject } from 'react-router';
import { ShellLayout } from './layouts/ShellLayout';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { ALL_NAV_ITEMS, HOME_PATH } from './navigation';

/** Route table: every SPEC §4 entry, a home redirect and a 404. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ShellLayout />,
    children: [
      { index: true, element: <Navigate to={HOME_PATH} replace /> },
      { path: HOME_PATH, element: <DashboardPage /> },
      ...ALL_NAV_ITEMS.filter((i) => i.path !== HOME_PATH).map((item) => ({ path: item.path, element: <PlaceholderPage /> })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
