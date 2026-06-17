import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import {
  queryRecurring,
  queryDueRecurring,
  createRecurring as createRecurringService,
  updateRecurring as updateRecurringService,
  deleteRecurring as deleteRecurringService,
} from '@/services/recurring.service'
import { createTransaction as createTxService } from '@/services/transaction.service'
import { formatDateSafe } from '@/lib/utils'
import type { RecurringTransaction, TransactionInsert, RecurringInsert, RecurringUpdate } from '@/types'

export type { RecurringTransaction }

export const useRecurring = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const {
    data: recurringData,
    isLoading: loading,
    refetch: fetchRecurring,
  } = useQuery({
    queryKey: ['recurring', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryRecurring(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 120_000,
  })

  const recurring = computed(() => recurringData.value || [])

  const addRecurring = async (
    item: Omit<RecurringInsert, 'user_id' | 'created_at'>,
  ) => {
    if (!user.value) return

    const result = await createRecurringService({
      ...item,
      user_id: user.value.id,
    } as RecurringInsert)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success(t('toast.recurring_added'))
      if (result.data) {
        activity.log('recurring', 'created', {
          description: result.data.description || result.data.type,
          amount: result.data.amount,
        })
      }
    } else {
      toast.error(t('toast.recurring_add_error'))
    }
    return { error: result.error }
  }

  const updateRecurring = async (
    id: string,
    updates: RecurringUpdate,
  ) => {
    const result = await updateRecurringService(id, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success(t('toast.recurring_updated'))
      if (result.data) {
        activity.log(
          'recurring',
          'updated',
          { description: result.data.description || result.data.type },
          id,
        )
      }
    } else {
      toast.error(t('toast.recurring_update_error'))
    }
    return { error: result.error }
  }

  const deleteRecurring = async (id: string) => {
    const recurringItem = recurring.value.find((r) => r.id === id)
    const result = await deleteRecurringService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success(t('toast.recurring_deleted'))
      activity.log(
        'recurring',
        'deleted',
        { description: recurringItem?.description || recurringItem?.type || '' },
        id,
      )
    } else {
      toast.error(t('toast.recurring_delete_error'))
    }
    return { error: result.error }
  }

  const toggleActive = async (id: string, active: boolean) => {
    return updateRecurring(id, { active })
  }

  /**
   * Process due recurring transactions — creates actual transactions and
   * advances next_date. Should be called on app startup and after toggling
   * a recurring item active.
   */
  const processDueRecurring = async (): Promise<number> => {
    if (!user.value) return 0

    const today = formatDateSafe(new Date())
    const result = await queryDueRecurring(user.value.id, today)

    if (result.error || !result.data || result.data.length === 0) return 0

    let created = 0

    for (const item of result.data) {
      // 1. Create the actual transaction
      const txResult = await createTxService({
        user_id: user.value.id,
        type: item.type,
        amount: item.amount,
        currency: item.currency,
        category_id: item.category_id,
        description: `[Auto] ${item.description || ''}`.trim(),
        date: today,
        account_id: null,
        image_url: null,
        splits: [],
      } as TransactionInsert)

      if (txResult.error) {
        console.error('Failed to create recurring transaction:', txResult.error)
        continue
      }

      // 2. Advance next_date based on frequency
      const next = new Date(item.next_date)
      switch (item.frequency) {
        case 'daily':
          next.setDate(next.getDate() + 1)
          break
        case 'weekly':
          next.setDate(next.getDate() + 7)
          break
        case 'monthly':
          next.setMonth(next.getMonth() + 1)
          break
        case 'yearly':
          next.setFullYear(next.getFullYear() + 1)
          break
      }
      const nextDate = formatDateSafe(next)

      await updateRecurringService(item.id, { next_date: nextDate })
      created++
    }

    if (created > 0) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success(t('toast.recurring_processed', { count: String(created) }))
    }

    return created
  }

  return {
    recurring,
    loading,
    fetchRecurring,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    processDueRecurring,
  }
}
