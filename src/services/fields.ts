/**
 * Shared select field strings for Supabase queries.
 * Define once, reuse everywhere — when the schema changes,
 * update only these constants.
 */
export const TRANSACTION_FIELDS =
  'account_id, amount, category_id, created_at, currency, date, description, id, image_url, receipt_image, splits, type, updated_at, user_id'

export const ACCOUNT_FIELDS =
  'id, name, type, color, icon, initial_balance, currency, user_id, created_at, updated_at'

export const CATEGORY_FIELDS =
  'color, created_at, icon, id, name, type, user_id'

export const GOAL_FIELDS =
  'color, created_at, current_amount, deadline, icon, id, image_url, name, target_amount, updated_at, user_id'

export const BUDGET_FIELDS =
  'amount, category_id, created_at, id, month, name, updated_at, user_id'

export const RECURRING_FIELDS =
  'active, amount, category_id, created_at, currency, description, frequency, id, next_date, type, updated_at, user_id'

export const BILL_FIELDS =
  'amount, created_at, due_date, id, is_paid, paid_with_account_id, recurrence, title, updated_at, user_id'

export const PROFILE_FIELDS =
  'avatar_url, created_at, currency, display_name, id, partner_id, updated_at'

export const SUBSCRIPTION_FIELDS =
  'id, user_id, name, amount, currency, billing_cycle, next_billing_date, category_id, account_id, active, reminder_days, created_at, updated_at'
