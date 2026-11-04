import { useState } from 'react';
import { Card, CardHeader, ProgressBar, SegmentedButton } from '@enterprise-ui/react';
import { useNavigate } from 'react-router';
import { FlowDiagram, type FlowEdge, type FlowNode } from '../../components/flow-diagram/FlowDiagram';
import type { MapEdge, MapNode, MapNodeId } from './types';
import { utilizationTone } from './MetricsGrid';

const POSITION: Record<MapNodeId, [col: number, lane: number]> = {
  customerIn: [0, 0], deposit: [1, 0], hot: [2, 0], cold: [3, 0],
  customerOut: [0, 1], mempool: [1, 1], withdrawal: [2, 1],
};
const TONE: Record<MapEdge['flow'], FlowEdge['tone']> = { inbound: 'success', internal: 'info', outbound: 'warning' };

/** SPEC §5.3 Exchange System Map. Node click opens its operational page. */
export function SystemMap({ nodes, edges }: { nodes: MapNode[]; edges: MapEdge[] }) {
  const navigate = useNavigate();
  const [asset, setAsset] = useState('all');
  const flowNodes: FlowNode[] = nodes.map((n) => ({
    id: n.id,
    col: POSITION[n.id][0],
    lane: POSITION[n.id][1],
    warning: n.warning,
    label: `${n.title}: ${n.value}, ${n.sub}. Open ${n.title}`,
    onSelect: () => void navigate(n.path),
    content: (
      <>
        <span className="cx-muted">{n.title}</span>
        <strong className="cx-flow-value">{n.value}</strong>
        <span className="cx-muted">{n.sub}</span>
        {n.utilizationBp !== undefined ? <ProgressBar value={n.utilizationBp / 100} tone={utilizationTone(n.utilizationBp)} size="sm" aria-hidden /> : null}
      </>
    ),
  }));
  return (
    <Card
      className="cx-map"
      flat
      header={
        <CardHeader
          title="Exchange System Map"
          headingLevel={2}
          actions={
            <SegmentedButton
              size="sm"
              aria-label="Map asset"
              value={[asset]}
              onChange={(v) => v[0] && setAsset(v[0])}
              items={[{ value: 'all', label: 'All' }, { value: 'BTC', label: 'BTC' }, { value: 'ETH', label: 'ETH' }, { value: 'USDT', label: 'USDT' }]}
            />
          }
        />
      }
      footer={<span className="cx-muted cx-card-footer">Click a node for its operational view · dashed = pending transfer · dots = live tx</span>}
    >
      <FlowDiagram
        aria-label="Flow of funds"
        columns={4}
        lanes={2}
        nodes={flowNodes}
        edges={edges.map((e) => ({ from: e.from, to: e.to, tone: TONE[e.flow], pending: e.pending, live: e.live }))}
      />
    </Card>
  );
}
