import { describe, expect, it } from 'vitest';
import { Accounts, UnknownAccountError, isValidAccount, parseAccount } from './accounts';

describe('chart of accounts', () => {
  it.each([
    ['asset:wallet:deposit:w1', 'asset', 'debit', 'blockchain-asset'],
    ['asset:wallet:hot:h1', 'asset', 'debit', 'blockchain-asset'],
    ['asset:wallet:cold:c1', 'asset', 'debit', 'blockchain-asset'],
    ['asset:wallet:reserve:r1', 'asset', 'debit', 'operational-reserve-asset'],
    ['asset:in-transit:t1', 'asset', 'debit', 'blockchain-asset'],
    ['liability:customer:c1:available', 'liability', 'credit', 'customer-liability'],
    ['liability:customer:c1:reserved', 'liability', 'credit', 'customer-liability'],
    ['revenue:trading-fees', 'revenue', 'credit', 'revenue'],
    ['revenue:withdrawal-fees', 'revenue', 'credit', 'revenue'],
    ['expense:network-fees', 'expense', 'debit', 'network-fee-expense'],
    ['equity:operational-reserves', 'equity', 'credit', 'operational-reserve-equity'],
    ['equity:opening-capital', 'equity', 'credit', 'opening-capital'],
    ['equity:conversion-clearing', 'equity', 'credit', 'conversion-clearing'],
  ])('%s', (id, type, side, category) => {
    const a = parseAccount(id);
    expect([a.type, a.normalSide, a.category]).toEqual([type, side, category]);
    expect(isValidAccount(id)).toBe(true);
  });
  it('extracts wallet and customer ids', () => {
    expect(parseAccount(Accounts.hotWallet('h9'))).toMatchObject({ walletKind: 'hot', walletId: 'h9' });
    expect(parseAccount(Accounts.customerReserved('c7')).customerId).toBe('c7');
  });
  it('rejects unknown accounts', () => {
    for (const bad of ['', 'asset:wallet:warm:x', 'liability:customer:c1', 'revenue:other', 'asset:wallet:hot:a b']) {
      expect(isValidAccount(bad)).toBe(false);
      expect(() => parseAccount(bad)).toThrow(UnknownAccountError);
    }
    expect(() => Accounts.hotWallet('bad id')).toThrow(UnknownAccountError);
  });
  it('builders produce valid ids', () => {
    expect(Accounts.wallet('cold', 'c')).toBe('asset:wallet:cold:c');
    expect(Accounts.depositWallet('d')).toBe('asset:wallet:deposit:d');
    expect(Accounts.coldWallet('c')).toBe('asset:wallet:cold:c');
    expect(Accounts.reserveWallet('r')).toBe('asset:wallet:reserve:r');
    expect(Accounts.inTransit('t')).toBe('asset:in-transit:t');
    expect(Accounts.customerAvailable('c')).toBe('liability:customer:c:available');
    expect(Accounts.conversionClearing).toBe('equity:conversion-clearing');
  });
});
