/**
 * App-level flow diagram (approved: built in Cryptex, not in ENTERPRISE-UI).
 * Nodes are laid out on a lane grid; edges are SVG paths with direction
 * arrows, dashed = pending, moving dots = live transactions.
 */
import type { ReactNode } from 'react';

export interface FlowNode {
  id: string;
  /** Zero-based column and lane. */
  col: number;
  lane: number;
  content: ReactNode;
  label: string;
  warning?: boolean;
  onSelect?: () => void;
}

export interface FlowEdge {
  from: string;
  to: string;
  tone: 'success' | 'info' | 'warning';
  pending?: boolean;
  live?: boolean;
}

export interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  columns: number;
  lanes: number;
  'aria-label': string;
}

const W = 1000;
const LANE_H = 260;

export function FlowDiagram({ nodes, edges, columns, lanes, 'aria-label': ariaLabel }: FlowDiagramProps) {
  const H = LANE_H * lanes;
  const center = (n: FlowNode) => ({ x: ((n.col + 0.5) / columns) * W, y: (n.lane + 0.5) * LANE_H });
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="cx-flow" role="group" aria-label={ariaLabel} style={{ minHeight: lanes * 150 }}>
      <svg className="cx-flow-edges" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          {(['success', 'info', 'warning'] as const).map((t) => (
            <marker key={t} id={`cx-arrow-${t}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" className={`cx-flow-arrow cx-flow--${t}`} />
            </marker>
          ))}
        </defs>
        {edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const p = center(a);
          const q = center(b);
          // Opposite edges on the same lane are offset so both stay visible.
          const offset = a.lane === b.lane ? (p.x < q.x ? -10 : 10) : 0;
          const d = `M${p.x},${p.y + offset} L${(p.x + q.x) / 2},${(p.y + q.y) / 2 + offset} L${q.x},${q.y + offset}`;
          return (
            <g key={`${e.from}-${e.to}`} className={`cx-flow--${e.tone}`} data-edge={`${e.from}->${e.to}`} data-pending={e.pending ? 'true' : undefined}>
              <path d={d} className={`cx-flow-edge${e.pending ? ' cx-flow-edge--pending' : ''}`} markerMid={`url(#cx-arrow-${e.tone})`} />
              {e.live ? (
                <circle r="5" className="cx-flow-dot">
                  <animateMotion dur="2.4s" repeatCount="indefinite" path={d} />
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>
      {nodes.map((n) => (
        <button
          key={n.id}
          type="button"
          className={`cx-flow-node${n.warning ? ' cx-flow-node--warning' : ''}`}
          style={{
            left: `${(n.col / columns) * 100}%`,
            top: `${(n.lane / lanes) * 100}%`,
            width: `${100 / columns}%`,
            height: `${100 / lanes}%`,
          }}
          aria-label={n.label}
          onClick={n.onSelect}
        >
          <span className="cx-flow-node-card">{n.content}</span>
        </button>
      ))}
    </div>
  );
}
