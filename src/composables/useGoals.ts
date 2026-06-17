import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  queryGoals,
  createGoal as createGoalService,
  updateGoal as updateGoalService,
  deleteGoal as deleteGoalService,
  addGoalFunds as addFundsService,
  uploadGoalImage as uploadImageService,
  deleteGoalImage as deleteImageService,
} from '@/services/goal.service'
import type { Goal, GoalInsert, GoalUpdate } from '@/types'

export const useGoals = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const partnerId = ref<string | undefined>()

  const {
    data: goalsData,
    isLoading: loadingGoals,
    refetch: fetchGoals,
  } = useQuery({
    queryKey: ['goals', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryGoals(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 30_000,
  })

  const {
    data: partnerGoalsData,
    isLoading: loadingPartnerGoals,
    refetch: fetchPartnerGoals,
  } = useQuery({
    queryKey: ['goals', partnerId],
    queryFn: async () => {
      if (!partnerId.value) return []
      const result = await queryGoals(partnerId.value)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!partnerId.value),
    staleTime: 30_000,
  })

  const goals = computed(() => goalsData.value || [])
  const partnerGoals = computed(() => partnerGoalsData.value || [])

  const setPartnerId = (id: string | undefined) => {
    partnerId.value = id
  }

  const fetchUserGoals = async (userId: string): Promise<Goal[]> => {
    const result = await queryGoals(userId)
    if (result.error) throw result.error
    return result.data || []
  }

  const addGoal = async (goal: Omit<GoalInsert, 'user_id' | 'created_at' | 'current_amount'>) => {
    if (!user.value) return { error: { message: 'Not authenticated' } }

    const result = await createGoalService({
      ...goal,
      user_id: user.value.id,
      current_amount: 0,
    } as GoalInsert)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success(t('toast.goal_added'))
      if (result.data) {
        activity.log(
          'goal',
          'created',
          { name: goal.name || '', target_amount: goal.target_amount || 0 },
          result.data.id,
        )
      }
    } else {
      toast.error(t('toast.goal_add_error'))
    }
    return { error: result.error }
  }

  const updateGoal = async (id: string, updates: GoalUpdate) => {
    const goalName = goals.value.find((g) => g.id === id)?.name || ''
    const result = await updateGoalService(id, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success(t('toast.goal_updated'))
      activity.log('goal', 'updated', { name: goalName, ...updates }, id)
    } else {
      toast.error(t('toast.goal_update_error'))
    }
    return { error: result.error }
  }

  const addFunds = async (goalId: string, amount: number) => {
    const goal = goals.value.find((g) => g.id === goalId)
    if (!goal) return { error: { message: 'Goal not found' } }

    const result = await addFundsService(goalId, amount)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success(t('toast.funds_added'))
      activity.log('goal', 'updated', { name: goal.name, amount_added: amount }, goalId)
    } else {
      toast.error(t('toast.funds_add_error'))
    }
    return { data: result.data, error: result.error }
  }

  const uploadGoalImage = async (file: File): Promise<string | null> => {
    if (!user.value) return null
    const result = await uploadImageService(user.value.id, file)
    if (result.error) {
      toast.error(t('goals.upload_error'))
      return null
    }
    return result.data
  }

  const deleteGoalImage = async (url: string) => {
    const result = await deleteImageService(url, user.value?.id)
    return { error: result.error }
  }

  const deleteGoal = async (id: string) => {
    const goal = goals.value.find((g) => g.id === id)
    if (goal?.image_url) {
      await deleteGoalImage(goal.image_url)
    }

    const result = await deleteGoalService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success(t('toast.goal_deleted'))
      activity.log('goal', 'deleted', { name: goal?.name || '' }, id)
    } else {
      toast.error(t('toast.goal_delete_error'))
    }
    return { error: result.error }
  }

  return {
    goals,
    partnerGoals,
    setPartnerId,
    loading: computed(() => loadingGoals.value || loadingPartnerGoals.value),
    fetchGoals,
    fetchPartnerGoals,
    fetchUserGoals,
    addGoal,
    updateGoal,
    addFunds,
    uploadGoalImage,
    deleteGoalImage,
    deleteGoal,
  }
}
