import { computed, ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  queryBudgets,
  createBudget as createBudgetService,
  updateBudget as updateBudgetService,
  deleteBudget as deleteBudgetService,
  queryBudgetWithProgress as queryBudgetWithProgressService,
  getBudgetProgress,
} from '@/services/budget.service'
import type { BudgetWithProgress, BudgetUpdate } from '@/types'

// Session-level dedup: prevents re-alerting the same budget+threshold until page refresh
const alertedThresholds = new Set<string>()

export const useBudgets = () => {
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const { user } = useAuth()

  const currentMonth = ref<string>('')
  const targetUserId = ref<string | undefined>()

  const {
    data: budgetsData,
    isLoading: budgetsLoading,
    refetch: refetchBudgets,
  } = useQuery({
    queryKey: ['budgets', computed(() => user.value?.id), currentMonth],
    queryFn: async () => {
      if (!user.value || !currentMonth.value) return []
      const result = await queryBudgets(user.value.id, currentMonth.value)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value && !!currentMonth.value),
    staleTime: 60_000,
  })

  const {
    data: progressData,
    isLoading: progressLoading,
    refetch: _refetchBudgetProgress,
  } = useQuery({
    queryKey: ['budgets:with-progress', computed(() => targetUserId.value || user.value?.id), currentMonth],
    queryFn: async () => {
      const uid = targetUserId.value || user.value?.id
      if (!uid || !currentMonth.value) return []
      const result = await queryBudgetWithProgressService(uid, currentMonth.value)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!(targetUserId.value || user.value?.id) && !!currentMonth.value),
    staleTime: 30_000,
  })

  const budgets = computed(() => budgetsData.value || [])
  const budgetsWithProgress = computed(() => progressData.value || [])

  const fetchBudgets = async (month: string) => {
    currentMonth.value = month
    await refetchBudgets()
  }

  const fetchBudgetWithProgress = async (
    month: string,
    userId?: string,
  ): Promise<BudgetWithProgress[]> => {
    currentMonth.value = month
    targetUserId.value = userId
    const uid = userId || user.value?.id
    if (!uid) return []

    return queryClient.fetchQuery({
      queryKey: ['budgets:with-progress', uid, month],
      queryFn: async () => {
        const result = await queryBudgetWithProgressService(uid, month)
        if (result.error) throw result.error
        return result.data || []
      },
      staleTime: 30_000,
    })
  }

  const createBudget = async (
    categoryId: string,
    month: string,
    amount: number,
    name?: string | null,
  ) => {
    if (!user.value) {
      toast.error(t('toast.login_required'))
      return { error: new Error('Not authenticated') }
    }

    const result = await createBudgetService(user.value.id, categoryId, month, amount, name)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets:with-progress'] })
      await fetchBudgets(month)
      toast.success(t('budget.saved'))
      activity.log('budget', 'created', { category_name: name || categoryId, amount })
    } else {
      toast.error(t('budget.save_error'))
    }

    return { error: result.error }
  }

  const setBudget = async (categoryId: string, month: string, amount: number) => {
    if (!user.value) {
      toast.error(t('toast.login_required'))
      return { error: new Error('Not authenticated') }
    }

    // This one is slightly custom because of maybeSingle, keeping it simple by reusing service calls
    const budgets = await fetchBudgetWithProgress(month)
    const existing = budgets.find((b) => b.category_id === categoryId)

    let result
    if (existing) {
      result = await updateBudgetService(existing.id, { amount })
    } else {
      result = await createBudgetService(user.value.id, categoryId, month, amount)
    }

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets:with-progress'] })
      await fetchBudgets(month)
      toast.success(t('budget.saved'))
      activity.log('budget', existing ? 'updated' : 'created', {
        category_name: categoryId,
        amount,
      })
    } else {
      toast.error(t('budget.save_error'))
    }

    return { error: result.error }
  }

  const updateBudget = async (
    id: string,
    data: { amount?: number; name?: string | null },
    month: string,
  ) => {
    if (!user.value) {
      toast.error(t('toast.login_required'))
      return { error: new Error('Not authenticated') }
    }

    const result = await updateBudgetService(id, data as BudgetUpdate)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets:with-progress'] })
      await fetchBudgets(month)
      toast.success(t('budget.saved'))
      activity.log('budget', 'updated', { id, ...data })
    } else {
      toast.error(t('budget.save_error'))
    }

    return { error: result.error }
  }

  const deleteBudget = async (id: string, month: string) => {
    const budget = budgets.value.find((b) => b.id === id)
    const categoryId = budget?.category_id || ''
    const result = await deleteBudgetService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets:with-progress'] })
      await fetchBudgets(month)
      toast.success(t('budget.deleted'))
      activity.log('budget', 'deleted', { category_name: categoryId }, id)
    } else {
      toast.error(t('budget.delete_error'))
    }

    return { error: result.error }
  }

  /**
   * Check all current-month budgets and alert if any are at or above thresholds.
   * Toast at >=80% (info), toast at >=100% (error).
   * Deduplicated per session — each budget+threshold alerts only once until refresh.
   */
  const checkBudgetAlerts = async (month: string): Promise<void> => {
    if (!user.value) return
    const budgets = await fetchBudgetWithProgress(month)
    if (!budgets.length) return

    for (const budget of budgets) {
      if (budget.amount <= 0) continue
      const rawPct = (budget.spent / budget.amount) * 100
      const exceededKey = `${budget.id}:exceeded`
      const warningKey = `${budget.id}:warning`

      if (rawPct >= 100 && !alertedThresholds.has(exceededKey)) {
        alertedThresholds.add(exceededKey)
        alertedThresholds.add(warningKey) // skip warning since we already showed exceeded
        toast.error(t('budget.alert_exceeded', { category: budget.category_name }))
        activity.log('budget', 'alert_exceeded', {
          category_name: budget.category_name,
          percentage: Math.round(rawPct),
        })
      } else if (rawPct >= 80 && !alertedThresholds.has(warningKey)) {
        alertedThresholds.add(warningKey)
        toast.info(
          t('budget.alert_warning', {
            category: budget.category_name,
            percentage: Math.round(rawPct),
          }),
        )
        activity.log('budget', 'alert_warning', {
          category_name: budget.category_name,
          percentage: Math.round(rawPct),
        })
      }
    }
  }

  return {
    budgets,
    budgetsWithProgress,
    loading: computed(() => budgetsLoading.value || progressLoading.value),
    fetchBudgets,
    fetchBudgetWithProgress,
    setBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    getProgress: getBudgetProgress,
    checkBudgetAlerts,
  }
}
