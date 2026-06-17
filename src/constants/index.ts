/**
 * Shared application constants.
 * Centralise magic strings, query keys, and configuration defaults.
 */

// ── Magic strings ──────────────────────────────────────────────

/** Sentinal value meaning "all" or "no filter" in filter dropdowns */
export const FILTER_ALL = '__all__'

/** Names used to identify the transfer category (in order of preference) */
export const TRANSFER_CATEGORY_NAMES = ['transfer', 'pindah buku', 'mutasi']

/** Default base currency */
export const DEFAULT_CURRENCY = 'IDR'

/** Currencies that don't use decimal places */
export const NO_DECIMAL_CURRENCIES = ['IDR', 'JPY', 'KRW', 'VND', 'KHR', 'LAK', 'MMK']

// ── TanStack Vue Query stale time tiers (in ms) ───────────────

export const STALE_TIMES = {
  /** Data that changes frequently (activity logs, exchange rates) */
  FREQUENT: 5_000,
  /** Default for most data (transactions, summary) */
  DEFAULT: 30_000,
  /** Data that changes daily (bills, budgets) */
  DAILY: 60_000,
  /** Data that rarely changes (accounts, recurring) */
  RARELY: 120_000,
  /** Reference data (categories) */
  STATIC: 300_000,
} as const

// ── Pagination defaults ───────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20

// ── Query keys ─────────────────────────────────────────────────

export const QUERY_KEYS = {
  ACCOUNTS: 'accounts',
  BUDGETS: 'budgets',
  CATEGORIES: 'categories',
  EXCHANGE_RATES: 'exchange-rates',
  GOALS: 'goals',
  MY_PROFILE: 'myProfile',
  PARTNER: 'partner',
  INVITATIONS_SENT: 'invitations:sent',
  INVITATIONS_RECEIVED: 'invitations:received',
  TRANSACTIONS: 'transactions',
  RECURRING: 'recurring',
  BILLS: 'bills',
  ACTIVITIES: 'activities',
  NET_WORTH: 'netWorth',
} as const
