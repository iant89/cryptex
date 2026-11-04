import { Button, NavigationItem, SideNavigation, useAppShell } from '@enterprise-ui/react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { ALL_NAV_ITEMS, NAV_GROUPS, findNavItem } from '../navigation';

/** SPEC §4 navigation. Groups are expandable sections; the active group is expanded. */
export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const shell = useAppShell();
  const match = findNavItem(location.pathname);
  const collapsed = shell?.navCollapsed ?? false;

  return (
    <SideNavigation
      className="cx-sidenav"
      activeId={match?.item.id}
      onNavigate={(id, event) => {
        const item = ALL_NAV_ITEMS.find((i) => i.id === id);
        if (!item) return;
        event.preventDefault();
        void navigate(item.path);
      }}
      footer={
        <div className="cx-sidenav-footer">
        <Button
          variant="tertiary"
          size="sm"
          neutral
          className="cx-collapse"
          icon={collapsed ? <ChevronsRight size={14} aria-hidden /> : <ChevronsLeft size={14} aria-hidden />}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          onClick={() => shell?.setNavCollapsed(!collapsed)}
        >
          {collapsed ? null : 'Collapse'}
        </Button>
          {collapsed ? null : <span className="cx-muted cx-sim-note">Simulation only</span>}
        </div>
      }
    >
      {NAV_GROUPS.map((g) => (
        <NavigationItem
          key={g.id}
          id={`group:${g.id}`}
          label={g.label}
          defaultExpanded={g.id === 'overview' || g.id === match?.group.id}
        >
          {g.items.map((item) => (
            <NavigationItem key={item.id} id={item.id} label={item.label} href={item.path} />
          ))}
        </NavigationItem>
      ))}
    </SideNavigation>
  );
}
