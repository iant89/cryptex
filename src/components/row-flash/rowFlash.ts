/**
 * App-level "row flash" (approved): rows that arrived within the highlight
 * window get an information highlight via the ENTERPRISE-UI Table
 * `getRowHighlight` hook. Pure, so a live store only has to set `isNew`.
 */
import type { Tone } from '@enterprise-ui/react';

export const ROW_FLASH_MS = 2000;

export function rowFlashHighlight<T extends { isNew?: boolean }>(row: T): Tone | undefined {
  return row.isNew ? 'information' : undefined;
}
