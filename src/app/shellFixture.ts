/**
 * Static header/activity data for the shell until the simulation engine
 * (Phase 2+) feeds live selectors. Illustrative only.
 */
import type { Tone } from '@enterprise-ui/react';

export type SimSpeed = 'pause' | '1' | '5' | '20' | '100';

export interface ShellStatus {
  exchange: { label: string; tone: Tone };
  simulation: { state: 'Running' | 'Paused'; day: number; clock: string };
  speed: SimSpeed;
  notificationCount: number;
}

export interface ActivityAlert {
  id: string;
  tone: Tone;
  message: string;
  time: string;
}

export const SHELL_STATUS: ShellStatus = {
  exchange: { label: 'Operational', tone: 'success' },
  simulation: { state: 'Running', day: 14, clock: '09:32:08' },
  speed: '5',
  notificationCount: 7,
};

export const ACTIVITY_ALERTS: readonly ActivityAlert[] = [
  { id: 'a1', tone: 'error', message: 'Withdrawal failed — insufficient BTC hot wallet balance', time: '09:31:57' },
  { id: 'a2', tone: 'warning', message: 'ETH hot wallet utilization 82% (threshold 80%)', time: '09:30:12' },
  { id: 'a3', tone: 'information', message: 'Block #1,204,887 mined · 214 tx · gas 18 gwei', time: '09:29:40' },
  { id: 'a4', tone: 'success', message: 'Sweep DW-ETH-07 → HW-ETH-01 confirmed', time: '09:28:03' },
  { id: 'a5', tone: 'warning', message: 'Withdrawal queue > 40 items', time: '09:25:44' },
  { id: 'a6', tone: 'information', message: "Scenario 'Weekend volume' active", time: '09:20:00' },
  { id: 'a7', tone: 'success', message: 'Cold → Hot replenishment 120 ETH confirmed', time: '09:12:31' },
];
