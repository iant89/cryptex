import { AppShell } from '@enterprise-ui/react';
import { Outlet } from 'react-router';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';
import { ActivityPanel } from './ActivityPanel';
import { useActivityPanel } from '../providers/ActivityPanelContext';

export function ShellLayout() {
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
