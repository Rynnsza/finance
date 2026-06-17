import { useSupabase } from '@/lib/supabase'
import { queryList, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { validateAmount } from '@/lib/utils'
import { RECURRING_FIELDS } from '@/services/fields'
import type { Result, RecurringTransaction, RecurringInsert, RecurringUpdate } from '@/types'
import { AppError } from '@/types/result'

export async function queryRecurring(userId: string): Promise<Result<RecurringTransaction[]>> {
  const supabase = useSupabase()
  return queryList<RecurringTransaction>(
    supabase
      .from('recurring_transactions')
      .select(RECURRING_FIELDS)
      .eq('user_id', userId)
      .order('next_date', { ascending: true }),
  )
}

export async function createRecurring(recurring: RecurringInsert): Promise<Result<RecurringTransaction>> {
  const supabase = useSupabase()
  const valid = validateAmount(recurring.amount, true)
  if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }
  return mutationWithReturn<RecurringTransaction>(
    supabase.from('recurring_transactions').insert(recurring),
  )
}

export async function updateRecurring(
  id: string,
  updates: RecurringUpdate,
): Promise<Result<RecurringTransaction>> {
  const supabase = useSupabase()
  if (updates.amount !== undefined) {
    const valid = validateAmount(updates.amount, true)
    if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }
  }
  return mutationWithReturn<RecurringTransaction>(
    supabase.from('recurring_transactions').update(updates).eq('id', id),
  )
}

export async function deleteRecurring(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(
    supabase.from('recurring_transactions').delete().eq('id', id),
  )
}

export async function queryDueRecurring(userId: string, today: string): Promise<Result<RecurringTransaction[]>> {
  const supabase = useSupabase()
  return queryList<RecurringTransaction>(
    supabase
      .from('recurring_transactions')
      .select(RECURRING_FIELDS)
      .eq('user_id', userId)
      .eq('active', true)
      .lte('next_date', today),
  )
}
