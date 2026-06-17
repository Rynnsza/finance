import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import {
  queryBills,
  createBill as createBillService,
  updateBill as updateBillService,
  deleteBill as deleteBillService,
  markBillAsPaid as markAsPaidService,
} from '@/services/bill.service'
import type { BillInsert, Database } from '@/types'

export const useBills = () => {
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const { user } = useAuth()

  const {
    data: billsData,
    isLoading: loading,
    refetch: fetchBills,
  } = useQuery({
    queryKey: ['bills', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryBills(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 60_000,
  })

  const bills = computed(() => billsData.value || [])

  const addBill = async (
    bill: Omit<Database['public']['Tables']['bills']['Insert'], 'user_id' | 'created_at' | 'is_paid'>,
  ) => {
    if (!user.value) return { error: new Error('Not authenticated') }

    const result = await createBillService({
      ...bill,
      user_id: user.value.id,
      is_paid: false,
    } as BillInsert)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success(t('bills.saved'))
      activity.log('bill', 'created', { name: bill.title, amount: bill.amount })
    } else {
      toast.error(t('bills.save_error'))
    }
    return { error: result.error }
  }

  const updateBill = async (id: string, updates: Database['public']['Tables']['bills']['Update']) => {
    const result = await updateBillService(id, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success(t('bills.saved'))
      if (result.data) {
        activity.log('bill', 'updated', { name: result.data.title, amount: result.data.amount }, id)
      }
    } else {
      toast.error(t('bills.save_error'))
    }
    return { error: result.error }
  }

  const deleteBill = async (id: string) => {
    const billTitle = bills.value.find((b) => b.id === id)?.title || ''
    const result = await deleteBillService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success(t('bills.deleted'))
      activity.log('bill', 'deleted', { name: billTitle }, id)
    } else {
      toast.error(t('bills.delete_error'))
    }
    return { error: result.error }
  }

  const markAsPaid = async (id: string, accountId?: string) => {
    const result = await markAsPaidService(id, accountId)
    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success(t('bills.saved'))
      if (result.data) {
        activity.log('bill', 'updated', { name: result.data.title, amount: result.data.amount }, id)
      }
    } else {
      toast.error(t('bills.save_error'))
    }
    return { error: result.error }
  }

  return {
    bills,
    loading,
    fetchBills,
    addBill,
    updateBill,
    deleteBill,
    markAsPaid,
  }
}
