import { Ledger } from '../engines/accounting';
import { ManualClock, SequentialIdGenerator } from '../core/simulation';

export function makeLedger() {
  const clock = new ManualClock(1_000);
  const ids = new SequentialIdGenerator('t');
  return { clock, ids, ledger: new Ledger({ clock, ids }) };
}
