import type { CustomerId, TransferId, WalletId } from '../../models/ids';

/**
 * Chart of accounts (docs/phase1-plan.md §3.2, SPEC §11). Accounts are per
 * asset: the same AccountId carries a separate balance for every asset.
 */
export type AccountType = 'asset' | 'liability' | 'revenue' | 'expense' | 'equity';
export type Side = 'debit' | 'credit';
export type AccountId = string & { readonly __brand: 'AccountId' };

/** Customer wallets hold customer funds; `reserve` wallets are exchange-owned operational reserves. */
export type WalletKind = 'deposit' | 'hot' | 'cold' | 'reserve';
export const WALLET_KINDS: readonly WalletKind[] = ['deposit', 'hot', 'cold', 'reserve'];

export type AccountCategory =
  | 'customer-liability'
  | 'blockchain-asset'
  | 'operational-reserve-asset'
  | 'revenue'
  | 'network-fee-expense'
  | 'operational-reserve-equity'
  | 'equity';

export interface AccountInfo {
  readonly id: AccountId;
  readonly type: AccountType;
  readonly category: AccountCategory;
  readonly normalSide: Side;
  readonly walletKind?: WalletKind;
  readonly walletId?: string;
  readonly customerId?: string;
}

const NORMAL_SIDE: Record<AccountType, Side> = {
  asset: 'debit',
  expense: 'debit',
  liability: 'credit',
  revenue: 'credit',
  equity: 'credit',
};

const SEG = '[A-Za-z0-9_.-]+';
const PATTERNS: ReadonlyArray<[RegExp, (m: RegExpExecArray) => Omit<AccountInfo, 'id' | 'normalSide'>]> = [
  [
    new RegExp(`^asset:wallet:(deposit|hot|cold|reserve):(${SEG})$`),
    (m) => ({
      type: 'asset',
      category: m[1] === 'reserve' ? 'operational-reserve-asset' : 'blockchain-asset',
      walletKind: m[1] as WalletKind,
      walletId: m[2],
    }),
  ],
  [new RegExp(`^asset:in-transit:(${SEG})$`), () => ({ type: 'asset', category: 'blockchain-asset' })],
  [
    new RegExp(`^liability:customer:(${SEG}):(available|reserved)$`),
    (m) => ({ type: 'liability', category: 'customer-liability', customerId: m[1] }),
  ],
  [/^revenue:(trading-fees|withdrawal-fees)$/, () => ({ type: 'revenue', category: 'revenue' })],
  [/^expense:network-fees$/, () => ({ type: 'expense', category: 'network-fee-expense' })],
  [/^equity:operational-reserves$/, () => ({ type: 'equity', category: 'operational-reserve-equity' })],
  [/^equity:(opening-capital|conversion-clearing)$/, () => ({ type: 'equity', category: 'equity' })],
];

export class UnknownAccountError extends Error {
  constructor(id: string) {
    super(`Unknown account: ${id}`);
    this.name = 'UnknownAccountError';
  }
}

export function parseAccount(id: string): AccountInfo {
  for (const [re, build] of PATTERNS) {
    const m = re.exec(id);
    if (m) {
      const info = build(m);
      return Object.freeze({ id: id as AccountId, normalSide: NORMAL_SIDE[info.type], ...info });
    }
  }
  throw new UnknownAccountError(id);
}

export function isValidAccount(id: string): id is AccountId {
  try {
    parseAccount(id);
    return true;
  } catch {
    return false;
  }
}

const mk = (s: string): AccountId => parseAccount(s).id;

export const Accounts = {
  wallet: (kind: WalletKind, walletId: WalletId | string) => mk(`asset:wallet:${kind}:${walletId}`),
  depositWallet: (id: WalletId | string) => mk(`asset:wallet:deposit:${id}`),
  hotWallet: (id: WalletId | string) => mk(`asset:wallet:hot:${id}`),
  coldWallet: (id: WalletId | string) => mk(`asset:wallet:cold:${id}`),
  /** Exchange-owned operational reserve wallet (not customer funds). */
  reserveWallet: (id: WalletId | string) => mk(`asset:wallet:reserve:${id}`),
  inTransit: (id: TransferId | string) => mk(`asset:in-transit:${id}`),
  customerAvailable: (id: CustomerId | string) => mk(`liability:customer:${id}:available`),
  customerReserved: (id: CustomerId | string) => mk(`liability:customer:${id}:reserved`),
  tradingFees: mk('revenue:trading-fees'),
  withdrawalFees: mk('revenue:withdrawal-fees'),
  networkFees: mk('expense:network-fees'),
  operationalReserves: mk('equity:operational-reserves'),
  openingCapital: mk('equity:opening-capital'),
  /** Approved clearing account for cross-asset trades and conversions. */
  conversionClearing: mk('equity:conversion-clearing'),
} as const;
