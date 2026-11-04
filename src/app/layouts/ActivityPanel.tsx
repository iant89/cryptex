import { IconButton, Link, Tab, TabList, TabPanel, Tabs, Title } from '@enterprise-ui/react';
import { X } from 'lucide-react';
import { ACTIVITY_ALERTS } from '../shellFixture';
import { useActivityPanel } from '../providers/ActivityPanelContext';

/** Right-hand Activity panel (Alerts / Events / Feed). Shares its slot with the DetailPanel. */
export function ActivityPanel() {
  const { setOpen } = useActivityPanel();
  return (
    <aside className="cx-side-panel" aria-labelledby="cx-activity-title">
      <Tabs defaultValue="alerts" variant="line" className="cx-activity-tabs">
        <div className="cx-side-panel-header">
          <Title level={2} size="xs" id="cx-activity-title">
            Activity
          </Title>
          <TabList aria-label="Activity views">
            <Tab value="alerts">Alerts</Tab>
            <Tab value="events">Events</Tab>
            <Tab value="feed">Feed</Tab>
          </TabList>
          <IconButton size="sm" icon={<X size={14} aria-hidden />} label="Close activity panel" onClick={() => setOpen(false)} />
        </div>
        <TabPanel value="alerts" flush>
          <ul className="cx-alert-list">
            {ACTIVITY_ALERTS.map((a) => (
              <li key={a.id} className="cx-alert">
                <span className={`cx-dot cx-dot--${a.tone}`} aria-hidden />
                <div>
                  <div className="cx-alert-message">
                    <span className="cx-visually-hidden">{a.tone}: </span>
                    {a.message}
                  </div>
                  <time className="cx-mono cx-muted">{a.time}</time>
                </div>
              </li>
            ))}
          </ul>
          <div className="cx-side-panel-footer">
            <Link href="/operations/incidents">View all in Incident Management →</Link>
          </div>
        </TabPanel>
        <TabPanel value="events" flush>
          <p className="cx-side-panel-empty">Domain events appear here once the simulation runs (Phase 2).</p>
        </TabPanel>
        <TabPanel value="feed" flush>
          <p className="cx-side-panel-empty">The live feed appears here once the simulation runs (Phase 2).</p>
        </TabPanel>
      </Tabs>
    </aside>
  );
}
