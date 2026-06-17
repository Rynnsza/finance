import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import {
  queryCategories,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  createDefaultCategories as seedDefaultsService,
} from '@/services/category.service'
import type { CategoryInsert, CategoryUpdate } from '@/types'

export const useCategories = () => {
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const { user } = useAuth()

  const {
    data: categoriesData,
    isLoading: loading,
    refetch: fetchCategories,
  } = useQuery({
    queryKey: ['categories', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryCategories(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 300_000,
  })

  const categories = computed(() => categoriesData.value || [])

  const seedDefaults = async (userId: string) => {
    const defaults = [
      { name: 'Gaji', icon: 'hugeicons:wallet-01', color: '#22c55e', type: 'income' },
      { name: 'Freelance', icon: 'hugeicons:laptop', color: '#3b82f6', type: 'income' },
      { name: 'Investasi', icon: 'hugeicons:chart', color: '#8b5cf6', type: 'income' },
      { name: 'Lainnya', icon: 'hugeicons:more-01', color: '#6b7280', type: 'income' },
      { name: 'Makanan', icon: 'hugeicons:restaurant-01', color: '#f97316', type: 'expense' },
      { name: 'Transport', icon: 'hugeicons:car-01', color: '#06b6d4', type: 'expense' },
      { name: 'Belanja', icon: 'hugeicons:shopping-bag-01', color: '#ec4899', type: 'expense' },
      { name: 'Tagihan', icon: 'hugeicons:receipt-text', color: '#ef4444', type: 'expense' },
      { name: 'Hiburan', icon: 'hugeicons:game-controller-01', color: '#a855f7', type: 'expense' },
      { name: 'Kesehatan', icon: 'hugeicons:health', color: '#14b8a6', type: 'expense' },
      { name: 'Lainnya', icon: 'hugeicons:more-01', color: '#6b7280', type: 'expense' },
    ]
    const result = await seedDefaultsService(userId, defaults)
    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      await fetchCategories()
    }
    return result
  }

  const addCategory = async (category: Omit<CategoryInsert, 'user_id' | 'created_at'>) => {
    if (!user.value) return

    const result = await createCategoryService({
      ...category,
      user_id: user.value.id,
    } as CategoryInsert)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('toast.category_added'))
      if (result.data) activity.log('category', 'created', { name: category.name || '' }, result.data.id)
    } else {
      toast.error(t('toast.category_add_error'))
    }
    return { error: result.error }
  }

  const updateCategory = async (id: string, updates: CategoryUpdate) => {
    const result = await updateCategoryService(id, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('toast.category_updated'))
      if (result.data) activity.log('category', 'updated', { name: result.data.name }, id)
    } else {
      toast.error(t('toast.category_update_error'))
    }
    return { error: result.error }
  }

  const deleteCategory = async (id: string) => {
    const deletedCategoryName = categories.value.find((c) => c.id === id)?.name || ''
    const result = await deleteCategoryService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('toast.category_deleted'))
      activity.log('category', 'deleted', { name: deletedCategoryName }, id)
    } else {
      toast.error(t('toast.category_delete_error'))
    }
    return { error: result.error }
  }

  const incomeCategories = computed(() => categories.value.filter((c) => c.type === 'income'))
  const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'))

  return {
    categories,
    loading,
    incomeCategories,
    expenseCategories,
    fetchCategories,
    seedDefaults,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
