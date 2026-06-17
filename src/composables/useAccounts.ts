import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from './nuxt-compat'
import {
  queryAccounts,
  createAccount as createAccountService,
  updateAccount as updateAccountService,
  deleteAccount as deleteAccountService,
  queryAccountBalances as queryAccountBalancesService,
} from '@/services/account.service'
import type { Account, AccountWithBalance, AccountInsert, AccountUpdate } from '@/types'

export const useAccounts = () => {
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const { user } = useAuth()
  const { defaultCurrency, convertTo } = useCurrency()

  const {
    data: accountsData,
    isLoading: loading,
    refetch: fetchAccounts,
  } = useQuery({
    queryKey: ['accounts', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryAccounts(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 120_000,
  })

  const {
    data: balancesData,
    isLoading: balancesLoading,
    refetch: fetchAccountBalances,
  } = useQuery({
    queryKey: ['account-balances', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryAccountBalancesService(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 60_000,
  })

  const accounts = computed(() => accountsData.value || [])
  const accountBalances = computed(() => balancesData.value || [])

  const addAccount = async (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user.value) {
      return { error: new Error('Not authenticated') }
    }
    const result = await createAccountService({
      ...account,
      user_id: user.value.id,
    } as AccountInsert)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['account-balances'] })
      toast.success(t('accounts.saved'))
      activity.log('account', 'created', { name: account.name, type: account.type })
    } else {
      toast.error(t('accounts.save_error'))
    }
    return { error: result.error }
  }

  const updateAccount = async (
    id: string,
    updates: AccountUpdate,
  ) => {
    const result = await updateAccountService(id, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['account-balances'] })
      toast.success(t('accounts.saved'))
      if (result.data) activity.log('account', 'updated', { name: result.data.name }, id)
    } else {
      toast.error(t('accounts.save_error'))
    }
    return { error: result.error }
  }

  const deleteAccount = async (id: string) => {
    const accountName = accounts.value.find((a) => a.id === id)?.name || ''
    const result = await deleteAccountService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['account-balances'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('accounts.deleted'))
      activity.log('account', 'deleted', { name: accountName }, id)
    } else {
      toast.error(t('accounts.delete_error'))
    }
    return { error: result.error }
  }

  const getAccountBalance = async (accountId: string): Promise<number> => {
    const balances = balancesData.value || (await getAccountBalances())
    const account = balances.find((a) => a.id === accountId)
    return account?.balance ?? 0
  }

  const getAccountBalances = async (): Promise<AccountWithBalance[]> => {
    if (!user.value) return []
    const result = await queryAccountBalancesService(user.value.id)
    if (result.error) throw result.error
    return result.data || []
  }

  const getConvertedBalances = async (): Promise<AccountWithBalance[]> => {
    const balances = balancesData.value || (await getAccountBalances())
    if (balances.length === 0) return []

    return balances.map((a) => {
      let convertedBalance = a.balance
      if (a.currency !== defaultCurrency.value) {
        const converted = convertTo(
          a.balance,
          a.currency || defaultCurrency.value,
          defaultCurrency.value,
        )
        if (converted !== null) {
          convertedBalance = converted
        }
      }

      return { ...a, balance: convertedBalance }
    })
  }

  const bankAccounts = computed(() => accounts.value.filter((a) => a.type === 'bank'))
  const ewalletAccounts = computed(() => accounts.value.filter((a) => a.type === 'e-wallet'))
  const cashAccounts = computed(() => accounts.value.filter((a) => a.type === 'cash'))
  const investmentAccounts = computed(() => accounts.value.filter((a) => a.type === 'investment'))
  const liabilityAccounts = computed(() => accounts.value.filter((a) => a.type === 'liability'))

  return {
    accounts,
    accountBalances,
    loading: computed(() => loading.value || balancesLoading.value),
    balancesLoading,
    fetchAccounts,
    fetchAccountBalances,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountBalance,
    getAccountBalances,
    getConvertedBalances,
    bankAccounts,
    ewalletAccounts,
    cashAccounts,
    investmentAccounts,
    liabilityAccounts,
  }
}
