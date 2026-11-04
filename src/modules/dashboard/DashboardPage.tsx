import { useEffect, useState } from 'react';
import { Button, Select } from '@enterprise-ui/react';
import { PanelRight } from 'lucide-react';
import { useLocation } from 'react-router';
import { findNavItem } from '../../app/navigation';
import { PageHeader } from '../../app/pages/PageHeader';
import { useActivityPanel } from '../../app/providers/ActivityPanelContext';
import { useDashboardSnapshot } from './source';
import { MetricsGrid } from './MetricsGrid';
import { LiveFeed } from './LiveFeed';
import { SystemMap } from './SystemMap';
import { TransactionDetailPanel } from './TransactionDetailPanel';
import './dashboard.css';

export function DashboardPage() {
  const match = findNavItem(useLocation().pathname);
  const snapshot = useDashboardSnapshot();
  const activity = useActivityPanel();
  const [selectedId, setSelectedId] = useState<string>();
  const selected = snapshot.feed.find((r) => r.id === selectedId);
  const { setOpen } = activity;

  // Only one right-hand panel at a time: inspecting a tx closes Activity.
  useEffect(() => {
    if (selected) setOpen(false);
  }, [selected, setOpen]);

  return (
    <section className="cx-page cx-dashboard" aria-labelledby="cx-page-title">
      {match ? (
        <PageHeader
          match={match}
          actions={
            <>
              <Select
                size="sm"
                aria-label="Valuation currency and asset"
                defaultValue="all"
                options={[{ value: 'all', label: 'All assets · USD' }]}
              />
              <Button size="sm" icon={<PanelRight size={14} aria-hidden />} aria-pressed={activity.open} onClick={activity.toggle}>
                Activity panel
              </Button>
            </>
          }
        />
      ) : null}
      <MetricsGrid metrics={snapshot.metrics} />
      <div className="cx-dashboard-lower">
        <LiveFeed rows={snapshot.feed} summary={snapshot.feedSummary} selectedId={selectedId} onSelect={(r) => setSelectedId(r.id)} />
        {selected ? (
          <TransactionDetailPanel row={selected} onClose={() => setSelectedId(undefined)} />
        ) : (
          <SystemMap nodes={snapshot.map.nodes} edges={snapshot.map.edges} />
        )}
      </div>
    </section>
  );
}
