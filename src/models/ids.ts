/** Branded string ids. Values come from an injected IdGenerator, never randomUUID. */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type TransactionId = Brand<string, 'TransactionId'>;
export type EventId = Brand<string, 'EventId'>;
export type CustomerId = Brand<string, 'CustomerId'>;
export type WalletId = Brand<string, 'WalletId'>;
export type TransferId = Brand<string, 'TransferId'>;
export type CorrelationId = Brand<string, 'CorrelationId'>;

export const asTransactionId = (s: string) => s as TransactionId;
export const asEventId = (s: string) => s as EventId;
export const asCustomerId = (s: string) => s as CustomerId;
export const asWalletId = (s: string) => s as WalletId;
export const asTransferId = (s: string) => s as TransferId;
export const asCorrelationId = (s: string) => s as CorrelationId;

/** Simulated time in milliseconds since simulation epoch (from an injected Clock). */
export type SimTime = number;
