import type { Database } from './database'
export type { Database, Json } from './database'
export type { Result } from './result'
export { AppError } from './result'

/** Non-recursive JSON type for Vue reactivity compatibility */
export type SafeJson =
  | string
  | number
  | boolean
  | null
  | { [key: string]: string | number | boolean | null | undefined }
  | Array<string | number | boolean | null>

// --- SHARED DOMAIN TYPES ---

// Account
export type AccountType = 'bank' | 'e-wallet' | 'cash' | 'investment' | 'liability'

export type Account = Omit<Database['public']['Tables']['accounts']['Row'], 'type'> & {
  type: AccountType
}
export type AccountRow = Account
export type AccountInsert = Omit<Database['public']['Tables']['accounts']['Insert'], 'type'> & {
  type: AccountType
}
export type AccountUpdate = Omit<Database['public']['Tables']['accounts']['Update'], 'type'> & {
  type?: AccountType
}
export interface AccountWithBalance extends Account {
  balance: number
}

// Transaction
export type TransactionType = 'income' | 'expense' | 'transfer'

export type TransactionRow = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Omit<
  Database['public']['Tables']['transactions']['Insert'],
  'type'
> & {
  type: TransactionType
  transfer_id?: string | null
}
export type TransactionUpdate = Omit<
  Database['public']['Tables']['transactions']['Update'],
  'type'
> & {
  type?: TransactionType
  transfer_id?: string | null
}

export interface SplitItem {
  category_id: string
  amount: number
  description?: string
  [key: string]: SafeJson | undefined
}

export type Transaction = Omit<TransactionRow, 'splits'> & {
  type: TransactionType
  splits: SplitItem[] | null
  transfer_id?: string | null
}

export interface TransactionFilters {
  type?: TransactionType
  category_id?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  startDate?: string // for service compatibility
  endDate?: string // for service compatibility
  amountMin?: number
  amountMax?: number
  account_id?: string
  user_id?: string
  currency?: string
}

// Budget
export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetRow = Budget
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']
export interface BudgetWithProgress extends Budget {
  category_name: string
  category_color: string
  category_icon: string
  spent: number
  rollover: number
}

// Category
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryRow = Category
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

// Goal
export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalRow = Goal
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']

// Bill
export type Bill = Database['public']['Tables']['bills']['Row']
export type BillRow = Bill
export type BillInsert = Database['public']['Tables']['bills']['Insert']
export type BillUpdate = Database['public']['Tables']['bills']['Update']

// Recurring Transaction
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type RecurringTransaction = Omit<
  Database['public']['Tables']['recurring_transactions']['Row'],
  'frequency'
> & {
  frequency: RecurringFrequency
}
export type RecurringRow = RecurringTransaction
export type RecurringInsert = Omit<
  Database['public']['Tables']['recurring_transactions']['Insert'],
  'frequency'
> & {
  frequency: RecurringFrequency
}
export type RecurringUpdate = Omit<
  Database['public']['Tables']['recurring_transactions']['Update'],
  'frequency'
> & {
  frequency?: RecurringFrequency
}

// Subscription
export type BillingCycle = 'weekly' | 'monthly' | 'yearly'

export type Subscription = Omit<
  Database['public']['Tables']['subscriptions']['Row'],
  'billing_cycle'
> & {
  billing_cycle: BillingCycle
}
export type SubscriptionRow = Subscription
export type SubscriptionInsert = Omit<
  Database['public']['Tables']['subscriptions']['Insert'],
  'billing_cycle'
> & {
  billing_cycle: BillingCycle
}
export type SubscriptionUpdate = Omit<
  Database['public']['Tables']['subscriptions']['Update'],
  'billing_cycle'
> & {
  billing_cycle?: BillingCycle
}

// Profile & Partner
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileRow = Profile
export type PartnerProfile = Profile
export type Invitation = Database['public']['Tables']['couple_invitations']['Row']
export type InvitationRow = Invitation
export interface CoupleInvitation extends Invitation {
  sender?: {
    display_name: string | null
    avatar_url: string | null
  }
}

// Activity Log
export type EntityType =
  | 'transaction'
  | 'category'
  | 'budget'
  | 'goal'
  | 'bill'
  | 'account'
  | 'recurring'
  | 'subscription'
  | 'todo'
  | 'partner'
  | 'auth'

export type ActionType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'bulk_updated'
  | 'bulk_deleted'
  | 'login'
  | 'logout'
  | 'connected'
  | 'disconnected'
  | 'alert_warning'
  | 'alert_exceeded'

export type ActivityLog = Omit<Database['public']['Tables']['activity_logs']['Row'], 'metadata'> & {
  metadata: Record<string, SafeJson | undefined>
}
export type ActivityLogRow = ActivityLog
export type ActivityLogInsert = Omit<
  Database['public']['Tables']['activity_logs']['Insert'],
  'entity_type' | 'action' | 'metadata'
> & {
  entity_type: EntityType
  action: ActionType
  metadata?: Record<string, SafeJson | undefined>
}

export interface ActivityLogFilters {
  page?: number
  limit?: number
  entityType?: EntityType | EntityType[] | string | string[]
  action?: ActionType | ActionType[] | string
  startDate?: string
  endDate?: string
}

// Utilities
export interface NetWorthData {
  label: string
  assets: number
  debts: number
  netWorth: number
  date: string
}
