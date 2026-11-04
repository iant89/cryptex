import { Badge, Button, DetailPanel, Link, Timeline } from '@enterprise-ui/react';
import { useNavigate } from 'react-router';
import type { FeedRow } from './types';
import { ASSET_DECIMALS } from './types';
import { formatUnits, formatUsd } from './format';
import { STATUS_TONE } from './LiveFeed';

const STEP_TONE = { done: 'success', current: 'information', pending: 'neutral' } as const;

/** Mockup 03: transaction inspect. Replaces the System Map while open (Ian-approved). */
export function TransactionDetailPanel({ row, onClose }: { row: FeedRow; onClose: () => void }) {
  const navigate = useNavigate();
  const d = row.detail;
  const dec = ASSET_DECIMALS[row.asset];
  const customerHref = row.customerId ? `/exchange/customers?id=${row.customerId}` : undefined;
  return (
    <DetailPanel
      open
      mode="inline"
      width="300px"
      className="cx-detail"
      title={`Transaction ${row.id}`}
      onClose={onClose}
      footer={
        <div className="cx-toolbar">
          <Button size="sm" disabled={!customerHref} onClick={() => customerHref && void navigate(customerHref)}>Open customer</Button>
          <Button size="sm" onClick={() => void navigate('/wallets/hot')}>View wallet</Button>
          <Button size="sm" variant="primary" onClick={() => void navigate('/operations/transaction-monitoring')}>Full view</Button>
        </div>
      }
    >
      <div className="cx-detail-head">
        <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
        <span className="cx-muted">{row.type} · {row.assetLabel}{d ? ` (${d.network})` : ''}</span>
      </div>
      <div className="cx-detail-amount">{formatUnits(row.units, dec, 2)} {row.asset}</div>
      <div className="cx-muted cx-mono">
        ≈ {formatUsd(row.usd)}{d ? ` · fee ${formatUnits(d.feeUnits, dec, 2)} ${row.asset}` : ''}
      </div>
      <dl className="cx-facts">
        <dt>Customer</dt>
        <dd>{customerHref ? <Link href={customerHref}>{row.customerId}{row.customerName ? ` · ${row.customerName}` : ''} →</Link> : '—'}</dd>
        {d ? (
          <>
            <dt>Source wallet</dt><dd><Link href="/wallets/hot">{d.sourceWallet} →</Link></dd>
            <dt>Destination</dt><dd className="cx-mono">{d.destination}</dd>
            <dt>Tx hash</dt><dd className="cx-mono">{d.txHash}</dd>
            <dt>Network fee</dt><dd>{d.networkFee}</dd>
            <dt>Risk score</dt><dd><Badge tone={d.risk.tone}>{d.risk.label}</Badge></dd>
          </>
        ) : null}
      </dl>
      {d ? (
        <section aria-labelledby="cx-lifecycle">
          <h3 id="cx-lifecycle" className="cx-section-title">Lifecycle (follow through system)</h3>
          <Timeline
            items={d.lifecycle.map((s) => ({
              id: s.id,
              title: s.state === 'current' ? <strong>{s.label}</strong> : s.label,
              timestamp: s.time,
              tone: STEP_TONE[s.state],
            }))}
          />
        </section>
      ) : (
        <p className="cx-muted">Lifecycle details arrive with the live simulation.</p>
      )}
    </DetailPanel>
  );
}
