import { MetricCard, ProgressBar, StatusIndicator } from '@enterprise-ui/react';
import type { Metric } from './types';
import { formatUsdCompact } from './format';

const pct = (bp: number) => `${Math.round(bp / 100)}%`;
export const utilizationTone = (bp: number) => (bp > 9_500 ? 'error' : bp > 8_000 ? 'warning' : 'information');

function MetricTile({ metric }: { metric: Metric }) {
  const v = metric.value;
  const value =
    v.kind === 'count' ? v.value.toLocaleString('en-US')
    : v.kind === 'usd' ? formatUsdCompact(v.value)
    : v.kind === 'percent' ? pct(v.basisPoints)
    : <StatusIndicator tone={v.tone} indicator="dot">{v.label}</StatusIndicator>;
  const footer =
    v.kind === 'percent' ? (
      <ProgressBar value={v.basisPoints / 100} tone={utilizationTone(v.basisPoints)} size="sm" aria-label={`${metric.label} ${pct(v.basisPoints)}`} />
    ) : metric.detail ? (
      <span className={`cx-metric-detail cx-metric-detail--${metric.detailTone ?? 'neutral'}`}>{metric.detail}</span>
    ) : undefined;
  return <MetricCard className="cx-metric" data-metric={metric.id} title={<span title={metric.label}>{metric.label}</span>} value={value} footer={footer} headingLevel={3} />;
}

/** SPEC §5.1: 16 metric slots, 8 columns × 2 rows. */
export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="cx-metrics" aria-label="Key metrics">
      {metrics.map((m) => <MetricTile key={m.id} metric={m} />)}
    </section>
  );
}
