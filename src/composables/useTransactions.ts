import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref, shallowRef } from 'vue'
import { getLocalTimeZone } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import {
  queryTransactions,
  getTransaction as getTxService,
  createTransaction as createTxService,
  createTransfer as createTransferService,
  updateTransaction as updateTxService,
  deleteTransaction as deleteTxService,
  bulkUpdateTransactions as bulkUpdateTxService,
  bulkDeleteTransactions as bulkDeleteTxService,
  searchTransactions as searchTxService,
  getTransactionSummary as getTxSummaryService,
  getCategoryStats as getCategoryStatsService,
  uploadTransactionImage as uploadImageService,
  deleteTransactionImage as deleteImageService,
} from '@/services/transaction.service'
import type { Transaction, TransactionFilters, TransactionInsert, TransactionUpdate } from '@/types'
import { FILTER_ALL } from '@/constants'

export type OwnerFilter = 'all' | 'mine' | 'partner'

export const useTransactionSummary = (
  userId: Ref<string | undefined>,
  startDate: Ref<string>,
  endDate: Ref<string>,
  targetCurrency: Ref<string>,
) => {
  return useQuery({
    queryKey: ['transaction-summary', userId, startDate, endDate, targetCurrency],
    queryFn: async () => {
      if (!userId.value) return null
      const result = await getTxSummaryService(
        userId.value,
        startDate.value,
        endDate.value,
        targetCurrency.value,
      )
      if (result.error) throw result.error
      return result.data
    },
    enabled: computed(() => !!userId.value),
    staleTime: 60_000,
  })
}

export const useCategoryStats = (
  userId: Ref<string | undefined>,
  startDate?: Ref<string | undefined>,
  endDate?: Ref<string | undefined>,
) => {
  return useQuery({
    queryKey: ['category-stats', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId.value) return []
      const result = await getCategoryStatsService(
        userId.value,
        startDate?.value,
        endDate?.value,
      )
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!userId.value),
    staleTime: 60_000,
  })
}

export const useTransactions = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const activity = useActivityLog()
  const { user } = useAuth()
  const { partner } = usePartner()
  const { categories } = useCategories()

  const currentPage = ref(1)
  const totalCount = ref(0)
  const pageSize = ref(20)

  // UI Filters
  const categoryFilter = ref('')
  const ownerFilter = ref<OwnerFilter>('all')
  const dateRange = shallowRef<DateRange>({ start: undefined, end: undefined })

  const serverFilters = computed<TransactionFilters>(() => {
    const res: TransactionFilters = {}
    if (categoryFilter.value && categoryFilter.value !== FILTER_ALL) {
      res.category_id = categoryFilter.value
    }
    if (ownerFilter.value === 'mine' && user.value?.id) {
      res.user_id = user.value.id
    } else if (ownerFilter.value === 'partner' && partner.value?.id) {
      res.user_id = partner.value.id
    }
    if (dateRange.value.start) {
      res.startDate = dateRange.value.start.toDate(getLocalTimeZone()).toISOString().slice(0, 10)
    }
    if (dateRange.value.end) {
      res.endDate = dateRange.value.end.toDate(getLocalTimeZone()).toISOString().slice(0, 10)
    }
    return res
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

  const partnerId = computed(() => partner.value?.id)

  const { data: transactionsData, isLoading: loading, refetch: refetchTransactions } = useQuery({
    queryKey: [
      'transactions',
      computed(() => user.value?.id),
      partnerId,
      serverFilters,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      if (!user.value) return { data: [], count: 0 }

      const result = await queryTransactions(user.value.id, serverFilters.value, currentPage.value, pageSize.value, partnerId.value)
      if (result.error) throw result.error

      totalCount.value = result.data?.count || 0
      return {
        data: (result.data?.data as Transaction[]) || [],
        count: result.data?.count || 0
      }
    },
    enabled: computed(() => !!user.value),
    staleTime: 30_000,
  })

  const transactions = computed<Transaction[]>(() => transactionsData.value?.data || [])

  const fetchTransactions = async (filters?: TransactionFilters, page = 1) => {
    categoryFilter.value = filters?.category_id || ''
    currentPage.value = page
    await refetchTransactions()
  }

  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
    currentPage.value = page
    await refetchTransactions()
  }

  const changePage = async (delta: number) => {
    await goToPage(currentPage.value + delta)
  }

  const addTransaction = async (
    tx: Omit<TransactionInsert, 'user_id' | 'created_at'>,
  ) => {
    if (!user.value) return { error: { message: 'Not authenticated' } }

    const result = await createTxService({ ...tx, user_id: user.value.id } as TransactionInsert)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.transaction_added'))
      if (result.data) {
        activity.log(
          'transaction',
          'created',
          {
            description: tx.description || '',
            amount: tx.amount,
            type: tx.type,
          },
          result.data.id,
        )
      }
    } else {
      toast.error(t('toast.transaction_add_error'))
    }
    return { error: result.error }
  }

  const addTransfer = async (data: {
    from_account_id: string
    to_account_id: string
    amount: number
    to_amount?: number
    currency: string
    to_currency?: string
    date: string
    description?: string
  }) => {
    if (!user.value) return { error: { message: 'Not authenticated' } }

    const transferCategory = categories.value.find(
      (c) =>
        c.name.toLowerCase() === 'transfer' ||
        c.name.toLowerCase() === 'pindah buku' ||
        c.name.toLowerCase() === 'mutasi',
    )

    const result = await createTransferService(user.value.id, {
      ...data,
      category_id: transferCategory?.id || '',
    })

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['account-balances'] })
      toast.success(t('toast.transfer_added'))
      if (result.data?.[0]) {
        activity.log(
          'transaction',
          'created',
          {
            description: data.description || 'Transfer',
            amount: data.amount,
            type: 'transfer',
          },
          result.data[0].id,
        )
      }
    } else {
      toast.error(t('toast.transaction_add_error'))
    }
    return { error: result.error }
  }

  const updateTransaction = async (
    id: string,
    updates: TransactionUpdate,
  ) => {
    const result = await updateTxService(id, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.transaction_updated'))
      activity.log(
        'transaction',
        'updated',
        {
          description: updates.description || '',
          amount: updates.amount,
        },
        id,
      )
    } else {
      toast.error(t('toast.transaction_update_error'))
    }
    return { error: result.error }
  }

  const deleteTransaction = async (id: string) => {
    const result = await deleteTxService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.transaction_deleted'))
      activity.log('transaction', 'deleted', {}, id)
    } else {
      toast.error(t('toast.transaction_delete_error'))
    }
    return { error: result.error }
  }

  const bulkUpdateTransactions = async (
    ids: string[],
    updates: TransactionUpdate,
  ) => {
    if (ids.length === 0) return { error: null }
    const result = await bulkUpdateTxService(ids, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.bulk_transactions_updated', { count: ids.length }))
      activity.log('transaction', 'bulk_updated', { count: ids.length, ...updates })
    } else {
      toast.error(t('toast.bulk_transactions_update_error'))
    }
    return { error: result.error }
  }

  const bulkDeleteTransactions = async (ids: string[]) => {
    if (ids.length === 0) return { error: null }
    const result = await bulkDeleteTxService(ids)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.bulk_transactions_deleted', { count: ids.length }))
      activity.log('transaction', 'bulk_deleted', { count: ids.length })
    } else {
      toast.error(t('toast.bulk_transactions_delete_error'))
    }
    return { error: result.error }
  }

  const getTransaction = async (id: string) => {
    return getTxService(id)
  }

  const searchTransactions = async (term: string): Promise<Transaction[]> => {
    if (!user.value || !term.trim()) return []
    const result = await searchTxService(user.value.id, term)
    return (result.data as Transaction[]) || []
  }

  const deleteTransactionImage = async (url: string) => {
    const result = await deleteImageService(url, user.value?.id)
    return { error: result.error }
  }

  const uploadTransactionImage = async (file: File): Promise<string | null> => {
    if (!user.value) return null
    const result = await uploadImageService(user.value.id, file)
    if (result.error) {
      toast.error(t('toast.upload_error'))
      return null
    }
    return result.data
  }

  const monthlySummary = computed(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const txs = transactions.value
    const monthTxs = txs.filter((tx) => {
      const d = new Date(tx.date)
      return d.getMonth() === month && d.getFullYear() === year
    })

    const income = monthTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const expense = monthTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    return { income, expense, balance: income - expense }
  })

  return {
    transactions,
    loading,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    fetchTransactions,
    categoryFilter,
    ownerFilter,
    dateRange,
    serverFilters,
    goToPage,
    changePage,
    searchTransactions,
    addTransaction,
    addTransfer,
    updateTransaction,
    deleteTransaction,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
    getTransaction,
    uploadTransactionImage,
    deleteTransactionImage,
    monthlySummary,
  }
}
