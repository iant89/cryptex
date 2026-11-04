import { AppShell } from '@enterprise-ui/react';
import { Outlet, useLocation } from 'react-router';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';
import { ActivityPanel } from './ActivityPanel';
import { ActivityPanelProvider, useActivityPanel } from '../providers/ActivityPanelContext';
import { HOME_PATH } from '../navigation';

function ShellFrame() {
  const activity = useActivityPanel();
  return (
    <AppShell className="cx-shell" header={<AppHeader />} navigation={<Sidebar />} defaultNavCollapsed={false}>
      <div className="cx-body">
        <div className="cx-workspace">
          <Outlet />
        </div>
        {activity.open ? <ActivityPanel /> : null}
      </div>
    </AppShell>
  );
}

export function ShellLayout() {
  const { pathname } = useLocation();
  return (
    <ActivityPanelProvider scope={pathname === HOME_PATH ? 'dashboard' : 'page'}>
      <ShellFrame />
    </ActivityPanelProvider>
  );
}
