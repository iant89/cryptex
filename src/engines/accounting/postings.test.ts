import { describe, expect, it } from 'vitest';
import { amount, parseAmount } from '../../models';
import { makeLedger } from '../../test/fixtures';
import { Accounts } from './accounts';
import * as P from './postings';
import { reconcile } from './reconcile';

const btc = (s: string) => parseAmount('BTC', s);
const usdt = (s: string) => parseAmount('USDT', s);
const D = Accounts.depositWallet('d1');
const H = Accounts.hotWallet('h1');
const K = Accounts.coldWallet('k1');
const R = Accounts.reserveWallet('r1');

const totalAssets = (l: ReturnType<typeof makeLedger>['ledger'], asset: 'BTC' | 'USDT') =>
  reconcile({ transactions: [...l.transactions()] }).assets.find((a) => a.asset === asset)!;

describe('posting builders', () => {
  it('deposit credits the customer exactly once (SPEC §20.6)', () => {
    const { ledger } = makeLedger();
    const d = P.deposit({ sourceEventId: 'dep-1' }, 'c1', D, btc('2.5'));
    ledger.post(d);
    ledger.post(d);
    expect(ledger.balanceOf(Accounts.customerAvailable('c1'), 'BTC')).toBe(250_000_000n);
    expect(ledger.balanceOf(D, 'BTC')).toBe(250_000_000n);
  });

  it('withdrawal: reserve → settle with separate network fee expense and fee revenue', () => {
    const { ledger } = makeLedger();
    ledger.post(P.openingCapital({ sourceEventId: 'cap' }, H, btc('1')));
    ledger.post(P.deposit({ sourceEventId: 'dep' }, 'c1', H, btc('2')));
    ledger.post(P.reserveWithdrawal({ sourceEventId: 'wr' }, 'c1', btc('1.0005')));
    expect(ledger.balanceOf(Accounts.customerAvailable('c1'), 'BTC')).toBe(btc('0.9995').units);
    expect(ledger.balanceOf(Accounts.customerReserved('c1'), 'BTC')).toBe(btc('1.0005').units);
    ledger.post(P.settleWithdrawal({ sourceEventId: 'ws' }, {
      customerId: 'c1', hotWallet: H, sent: btc('1'), withdrawalFee: btc('0.0005'), networkFee: btc('0.0001'),
    }));
    expect(ledger.balanceOf(Accounts.customerReserved('c1'), 'BTC')).toBe(0n);
    expect(ledger.balanceOf(Accounts.withdrawalFees, 'BTC')).toBe(btc('0.0005').units);
    expect(ledger.balanceOf(Accounts.networkFees, 'BTC')).toBe(btc('0.0001').units);
    expect(ledger.balanceOf(H, 'BTC')).toBe(btc('1.9999').units);
    expect(reconcile({ transactions: [...ledger.transactions()] }).ok).toBe(true);
  });

  it('failed withdrawal releases the reserve (SPEC §20.8)', () => {
    const { ledger } = makeLedger();
    ledger.post(P.deposit({ sourceEventId: 'dep' }, 'c1', H, btc('2')));
    ledger.post(P.reserveWithdrawal({ sourceEventId: 'wr' }, 'c1', btc('1')));
    ledger.post(P.releaseWithdrawal({ sourceEventId: 'wf' }, 'c1', btc('1')));
    expect(ledger.balanceOf(Accounts.customerAvailable('c1'), 'BTC')).toBe(btc('2').units);
    expect(ledger.balanceOf(Accounts.customerReserved('c1'), 'BTC')).toBe(0n);
  });

  it('zero fees are omitted rather than posted as zero entries', () => {
    const d = P.settleWithdrawal({ sourceEventId: 's' }, { customerId: 'c', hotWallet: H, sent: btc('1'), withdrawalFee: btc('0'), networkFee: btc('0') });
    expect(d.entries).toHaveLength(2);
  });

  it('wallet transfers conserve assets except the separately-expensed network fee (SPEC §20.9–10)', () => {
    const { ledger } = makeLedger();
    ledger.post(P.deposit({ sourceEventId: 'dep' }, 'c1', D, btc('3')));
    const before = totalAssets(ledger, 'BTC');
    ledger.post(P.walletTransfer({ sourceEventId: 'sweep' }, { from: D, to: H, amount: btc('2'), networkFee: btc('0.001') }));
    ledger.post(P.walletTransfer({ sourceEventId: 'cold' }, { from: H, to: K, amount: btc('1'), networkFee: btc('0') }));
    const after = totalAssets(ledger, 'BTC');
    expect(after.blockchainAssets + after.networkFeeExpense).toBe(before.blockchainAssets);
    expect(after.networkFeeExpense).toBe(btc('0.001').units);
    expect(after.customerLiabilities).toBe(before.customerLiabilities);
    expect(ledger.balanceOf(D, 'BTC')).toBe(btc('0.999').units);
  });

  it('on-chain transfer via in-transit account', () => {
    const { ledger } = makeLedger();
    ledger.post(P.openingCapital({ sourceEventId: 'cap' }, K, btc('5')));
    const disp = P.dispatchTransfer({ sourceEventId: 'd' }, { transferId: 't1', from: K, amount: btc('1'), networkFee: btc('0.0002') });
    expect(disp.kind).toBe('transfer-dispatch');
    ledger.post(disp);
    expect(ledger.balanceOf(Accounts.inTransit('t1'), 'BTC')).toBe(btc('1').units);
    ledger.post(P.arriveTransfer({ sourceEventId: 'a' }, { transferId: 't1', to: H, amount: btc('1') }));
    expect(ledger.balanceOf(Accounts.inTransit('t1'), 'BTC')).toBe(0n);
    expect(ledger.balanceOf(H, 'BTC')).toBe(btc('1').units);
  });

  it('operational reserves are exchange-owned and separate from customer liabilities', () => {
    const { ledger } = makeLedger();
    ledger.post(P.fundOperationalReserve({ sourceEventId: 'r' }, R, usdt('1000')));
    const s = totalAssets(ledger, 'USDT');
    expect(s.operationalReserveAssets).toBe(usdt('1000').units);
    expect(s.operationalReserveEquity).toBe(usdt('1000').units);
    expect(s.customerLiabilities).toBe(0n);
    expect(() => P.fundOperationalReserve({ sourceEventId: 'x' }, H, usdt('1'))).toThrow(RangeError);
  });

  it('cross-asset trade posts through the clearing account and balances per asset', () => {
    const { ledger } = makeLedger();
    ledger.post(P.deposit({ sourceEventId: 'd1' }, 'buyer', D, usdt('70000')));
    ledger.post(P.deposit({ sourceEventId: 'd2' }, 'seller', D, btc('1')));
    const t = P.trade({ sourceEventId: 'trade-1' }, {
      buyerId: 'buyer', sellerId: 'seller', base: btc('1'), quote: usdt('65000'),
      buyerFee: btc('0.001'), sellerFee: usdt('65'),
    });
    expect(t.entries.filter((x) => x.accountId === Accounts.conversionClearing).length).toBe(4);
    ledger.post(t);
    const ca = (id: string, a: 'BTC' | 'USDT') => ledger.balanceOf(Accounts.customerAvailable(id), a);
    expect(ca('buyer', 'BTC')).toBe(btc('0.999').units);
    expect(ca('buyer', 'USDT')).toBe(usdt('5000').units);
    expect(ca('seller', 'BTC')).toBe(0n);
    expect(ca('seller', 'USDT')).toBe(usdt('64935').units);
    expect(ledger.balanceOf(Accounts.tradingFees, 'BTC')).toBe(btc('0.001').units);
    expect(ledger.balanceOf(Accounts.tradingFees, 'USDT')).toBe(usdt('65').units);
    expect(ledger.balanceOf(Accounts.conversionClearing, 'BTC')).toBe(0n);
    expect(ledger.balanceOf(Accounts.conversionClearing, 'USDT')).toBe(0n);
    expect(reconcile({ transactions: [...ledger.transactions()] }).ok).toBe(true);
  });

  it('conversion against the exchange leaves the position in clearing', () => {
    const { ledger } = makeLedger();
    ledger.post(P.deposit({ sourceEventId: 'd1' }, 'c', D, usdt('100')));
    ledger.post(P.conversion({ sourceEventId: 'cv' }, { customerId: 'c', from: usdt('100'), to: amount('BTC', 150_000n), fee: amount('BTC', 150n) }));
    expect(ledger.balanceOf(Accounts.customerAvailable('c'), 'BTC')).toBe(149_850n);
    expect(ledger.balanceOf(Accounts.conversionClearing, 'USDT')).toBe(usdt('100').units);
    expect(ledger.balanceOf(Accounts.conversionClearing, 'BTC')).toBe(-150_000n);
    expect(ledger.trialBalance().get('BTC')).toBe(0n);
  });

  it('builders reject bad input', () => {
    const m = { sourceEventId: 'x' };
    expect(() => P.deposit(m, 'c', D, btc('0'))).toThrow(RangeError);
    expect(() => P.deposit(m, 'c', Accounts.customerAvailable('c'), btc('1'))).toThrow(RangeError);
    expect(() => P.openingCapital(m, H, btc('-1'))).toThrow(RangeError);
    expect(() => P.reserveWithdrawal(m, 'c', btc('0'))).toThrow(RangeError);
    expect(() => P.releaseWithdrawal(m, 'c', btc('0'))).toThrow(RangeError);
    expect(() => P.walletTransfer(m, { from: H, to: H, amount: btc('1'), networkFee: btc('0') })).toThrow(RangeError);
    expect(() => P.walletTransfer(m, { from: H, to: K, amount: btc('1'), networkFee: usdt('1') })).toThrow(RangeError);
    expect(() => P.walletTransfer(m, { from: H, to: K, amount: btc('1'), networkFee: btc('-1') })).toThrow(RangeError);
    expect(() => P.arriveTransfer(m, { transferId: 't', to: Accounts.networkFees, amount: btc('1') })).toThrow(RangeError);
    expect(() => P.trade(m, { buyerId: 'a', sellerId: 'b', base: btc('1'), quote: btc('1') })).toThrow(RangeError);
    expect(() => P.trade(m, { buyerId: 'a', sellerId: 'b', base: btc('1'), quote: usdt('1'), buyerFee: btc('2') })).toThrow(RangeError);
    expect(() => P.conversion(m, { customerId: 'a', from: btc('1'), to: btc('1') })).toThrow(RangeError);
    expect(() => P.conversion(m, { customerId: 'a', from: btc('1'), to: usdt('1'), fee: usdt('2') })).toThrow(RangeError);
  });
});
