import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useActivityLog } from '@/composables/useActivityLog'
import {
  querySubscriptions,
  createSubscription as createService,
  updateSubscription as updateService,
  deleteSubscription as deleteService,
} from '@/services/subscription.service'
import type { SubscriptionInsert, SubscriptionUpdate } from '@/types'

export const useSubscriptions = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const {
    data: subscriptionsData,
    isLoading: loading,
    refetch: fetchSubscriptions,
  } = useQuery({
    queryKey: ['subscriptions', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await querySubscriptions(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 120_000,
  })

  const subscriptions = computed(() => subscriptionsData.value || [])

  const addSubscription = async (item: Omit<SubscriptionInsert, 'user_id' | 'created_at'>) => {
    if (!user.value) return

    const result = await createService({
      ...item,
      user_id: user.value.id,
    } as SubscriptionInsert)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success(t('toast.subscription_added'))
      if (result.data) {
        activity.log('subscription', 'created', {
          name: result.data.name,
          amount: result.data.amount,
        })
      }
    } else {
      toast.error(t('toast.subscription_add_error'))
    }
    return { error: result.error, data: result.data }
  }

  const updateSubscription = async (id: string, updates: SubscriptionUpdate) => {
    const result = await updateService(id, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success(t('toast.subscription_updated'))
      if (result.data) {
        activity.log('subscription', 'updated', { name: result.data.name }, id)
      }
    } else {
      toast.error(t('toast.subscription_update_error'))
    }
    return { error: result.error, data: result.data }
  }

  const deleteSubscription = async (id: string) => {
    const subItem = subscriptions.value.find((s) => s.id === id)
    const result = await deleteService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success(t('toast.subscription_deleted'))
      activity.log('subscription', 'deleted', { name: subItem?.name || '' }, id)
    } else {
      toast.error(t('toast.subscription_delete_error'))
    }
    return { error: result.error }
  }

  const toggleActive = async (id: string, active: boolean) => {
    return updateSubscription(id, { active })
  }

  const monthlyTotal = computed(() => {
    return subscriptions.value
      .filter((s) => s.active)
      .reduce((total, s) => {
        let amount = Number(s.amount)
        if (s.billing_cycle === 'yearly') amount = amount / 12
        if (s.billing_cycle === 'weekly') amount = amount * 4
        return total + amount
      }, 0)
  })

  return {
    subscriptions,
    loading,
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
    monthlyTotal,
  }
}
