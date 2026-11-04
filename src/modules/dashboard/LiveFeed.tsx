import { Badge, Button, Card, CardHeader, Link, Table, type TableColumn, type Tone } from '@enterprise-ui/react';
import { ChevronDown, Pause } from 'lucide-react';
import type { FeedRow, FeedStatus } from './types';
import { ASSET_DECIMALS } from './types';
import { formatUnits, formatUsd } from './format';
import { rowFlashHighlight } from '../../components/row-flash/rowFlash';

export const STATUS_TONE: Record<FeedStatus, Tone> = {
  Confirming: 'information', Processing: 'information', Confirmed: 'success', Completed: 'success',
  Filled: 'success', Failed: 'error', Queued: 'neutral',
};

const amount = (r: FeedRow) => `${formatUnits(r.units, ASSET_DECIMALS[r.asset], 4)}${r.type === 'Conversion' ? ` ${r.asset}` : ''}`;

export interface LiveFeedProps {
  rows: FeedRow[];
  summary: string;
  selectedId?: string;
  onSelect: (row: FeedRow) => void;
}

/** SPEC §5.2 Live Transaction Feed. Filters render disabled until the live feed lands (plan Batch 4). */
export function LiveFeed({ rows, summary, selectedId, onSelect }: LiveFeedProps) {
  const columns: TableColumn<FeedRow>[] = [
    { id: 'time', header: 'Time', cell: (r) => <span className="cx-mono">{r.time}</span>, width: 80 },
    { id: 'type', header: 'Event', accessor: 'type', rowHeader: true },
    { id: 'asset', header: 'Asset', accessor: 'assetLabel' },
    { id: 'amount', header: 'Amount', align: 'end', cell: (r) => <span className="cx-mono">{amount(r)}</span> },
    { id: 'usd', header: 'USD', align: 'end', cell: (r) => <span className="cx-mono">{formatUsd(r.usd)}</span> },
    {
      id: 'customer', header: 'Customer',
      cell: (r) => (r.customerId ? <Link href={`/exchange/customers?id=${r.customerId}`} onClick={(e) => e.stopPropagation()}>{r.customerId}</Link> : '—'),
    },
    { id: 'status', header: 'Status', cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
  ];
  return (
    <Card
      className="cx-feed"
      flat
      noPadding
      header={
        <CardHeader
          title={<span className="cx-card-title">Live Transaction Feed <Badge tone="success" icon={<span className="cx-dot cx-dot--success cx-dot--inline" aria-hidden />}>Live</Badge></span>}
          headingLevel={2}
          actions={
            <div className="cx-toolbar">
              {['Type', 'Asset', 'Status'].map((f) => (
                <Button key={f} size="sm" disabled iconEnd={<ChevronDown size={12} aria-hidden />} title="Filters arrive with the live feed (Phase 2)">{f}</Button>
              ))}
              <Button size="sm" disabled aria-label="Pause feed" icon={<Pause size={12} aria-hidden />}>Pause</Button>
            </div>
          }
        />
      }
      footer={<span className="cx-muted cx-card-footer">Showing latest {rows.length} · {summary} · newest row highlighted 2 s</span>}
    >
      <Table
        aria-label="Live transaction feed"
        className="cx-feed-table"
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        getRowLabel={(r) => `${r.type} ${r.id}`}
        density="condensed"
        stickyHeader
        borderless
        onRowClick={onSelect}
        getRowHighlight={(r) => (r.id === selectedId ? 'warning' : rowFlashHighlight(r))}
      />
    </Card>
  );
}
