import { useState } from 'react';
import { ApplicationHeader, ButtonBadge, IconButton, SearchField, SegmentedButton, StatusIndicator } from '@enterprise-ui/react';
import { Pause, Zap } from 'lucide-react';
import { ACTIVITY_ALERTS, SHELL_STATUS, type SimSpeed } from '../shellFixture';
import { useActivityPanel } from '../providers/ActivityPanelContext';
import { HOME_PATH } from '../navigation';

const SPEED_ITEMS = [
  { value: 'pause', label: '', icon: <Pause size={12} aria-hidden />, ariaLabel: 'Pause' },
  { value: '1', label: '1×' },
  { value: '5', label: '5×' },
  { value: '20', label: '20×' },
  { value: '100', label: '100×' },
];

export interface AppHeaderProps {
  /** Extra header actions (e.g. the theme toggle). */
  extraActions?: React.ReactNode;
  logoSrc?: string;
}

export function AppHeader({ extraActions, logoSrc = '/logo-dark.svg' }: AppHeaderProps) {
  const [speed, setSpeed] = useState<SimSpeed>(SHELL_STATUS.speed);
  const activity = useActivityPanel();
  const { exchange, simulation } = SHELL_STATUS;
  const simState = speed === 'pause' ? 'Paused' : simulation.state;

  return (
    <ApplicationHeader
      className="cx-header"
      productName="Cryptex"
      homeHref={HOME_PATH}
      showNavToggle={false}
      logo={<img className="cx-header-logo" src={logoSrc} alt="Cryptex" height={28} />}
      search={
        <SearchField
          className="cx-header-search"
          size="sm"
          placeholder="Search tx, customer, wallet…"
          aria-label="Search transactions, customers and wallets"
        />
      }
      notificationCount={SHELL_STATUS.notificationCount}
      onNotificationsClick={() => undefined}
      user={{ name: 'Ian Thomas', role: 'Exchange operator' }}
      actions={
        <>
          <div className="cx-header-status" role="group" aria-label="Exchange status">
            <span className="cx-pill">
              <StatusIndicator tone={exchange.tone} indicator="dot" size="sm">
                Exchange: {exchange.label}
              </StatusIndicator>
            </span>
            <span className="cx-pill" data-testid="simulation-badge">
              <StatusIndicator tone={simState === 'Running' ? 'information' : 'neutral'} indicator="dot" size="sm">
                Simulation: {simState} · Day {simulation.day}, {simulation.clock}
              </StatusIndicator>
            </span>
            <span className="cx-speed-label" id="cx-speed-label">
              Speed
            </span>
            <SegmentedButton
              size="sm"
              aria-label="Simulation speed"
              items={SPEED_ITEMS}
              value={[speed]}
              onChange={(v) => v[0] && setSpeed(v[0] as SimSpeed)}
            />
          </div>
          <span className="cx-badged">
            <IconButton
              icon={<Zap size={16} aria-hidden />}
              label={`Activity panel, ${ACTIVITY_ALERTS.length} alerts`}
              aria-pressed={activity.open}
              onClick={activity.toggle}
            />
            <ButtonBadge design="overlay" text={String(ACTIVITY_ALERTS.length)} />
          </span>
          {extraActions}
        </>
      }
    />
  );
}
