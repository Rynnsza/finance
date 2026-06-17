import { useSupabase } from '@/lib/supabase'
import { queryList, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { validateAmount } from '@/lib/utils'
import { AppError } from '@/types/result'
import { SUBSCRIPTION_FIELDS } from '@/services/fields'
import type { Result, Subscription, SubscriptionInsert, SubscriptionUpdate } from '@/types'

export async function querySubscriptions(userId: string): Promise<Result<Subscription[]>> {
  const supabase = useSupabase()
  return queryList<Subscription>(
    supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_FIELDS)
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true }),
  )
}

export async function createSubscription(subscription: SubscriptionInsert): Promise<Result<Subscription>> {
  const supabase = useSupabase()
  const valid = validateAmount(subscription.amount, true)
  if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }
  return mutationWithReturn<Subscription>(
    supabase.from('subscriptions').insert(subscription),
  )
}

export async function updateSubscription(
  id: string,
  updates: SubscriptionUpdate,
): Promise<Result<Subscription>> {
  const supabase = useSupabase()
  if (updates.amount !== undefined) {
    const valid = validateAmount(updates.amount, true)
    if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }
  }
  return mutationWithReturn<Subscription>(
    supabase.from('subscriptions').update(updates).eq('id', id),
  )
}

export async function deleteSubscription(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(
    supabase.from('subscriptions').delete().eq('id', id),
  )
}
