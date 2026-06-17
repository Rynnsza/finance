import { ref, computed } from 'vue'
import { formatDateSafe } from '@/lib/utils'
import { useQueryClient } from '@tanstack/vue-query'
import { useI18n } from './nuxt-compat'
import { queryAccounts } from '@/services/account.service'
import { queryNetWorthTransactions } from '@/services/transaction.service'

export interface NetWorthData {
  label: string
  assets: number
  debts: number
  netWorth: number
  date: string
}

export const useNetWorth = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { locale } = useI18n()
  const { defaultCurrency, convertTo } = useCurrency()

  const history = ref<NetWorthData[]>([])
  const loading = ref(false)

  const fetchNetWorthHistory = async (months: number = 6) => {
    if (!user.value) {
      return
    }
    loading.value = true

    const cacheKey = ['netWorth', user.value.id, months]

    try {
      const result = await queryClient.fetchQuery({
        queryKey: cacheKey,
        queryFn: async () => {
          // 1. Fetch accounts — only columns needed
          const accountsResult = await queryAccounts(user.value!.id)
          if (accountsResult.error) throw accountsResult.error
          const accounts = accountsResult.data

          if (!accounts?.length) return []

          // 2. Fetch transactions — bounded by months lookback so payload doesn't grow unboundedly
          const now = new Date()
          const earliestDate = formatDateSafe(new Date(now.getFullYear(), now.getMonth() - months, 1))

          const transactionsResult = await queryNetWorthTransactions(user.value!.id, earliestDate!)
          if (transactionsResult.error) throw transactionsResult.error
          const transactions = transactionsResult.data

          const convertAmount = (amount: number, fromCurrency: string): number => {
            if (fromCurrency === defaultCurrency.value) return amount
            const converted = convertTo(amount, fromCurrency, defaultCurrency.value)
            return converted ?? amount
          }

          // Build month boundaries (oldest → newest)
          const monthBoundaries: { end: Date; label: string; dateStr: string }[] = []
          for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
            monthBoundaries.push({
              end: d,
              label: d.toLocaleDateString(locale.value, { month: 'short' }),
              dateStr: formatDateSafe(d) || '',
            })
          }

          // Sort transactions once by date ascending for single-pass processing
          const sortedTxs = (transactions || [])
            .filter((tx: { date: string }) => tx.date)
            .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))

          // Per-account running balance (initialized from account creation)
          const runningBalances = new Map<string, number>()
          const isLiability = new Map<string, boolean>()
          const accountCurrency = new Map<string, string>()
          const accountCreated = new Map<string, Date>()
          for (const acc of accounts) {
            runningBalances.set(acc.id, Number(acc.initial_balance))
            isLiability.set(acc.id, acc.type === 'liability')
            accountCurrency.set(acc.id, acc.currency || defaultCurrency.value)
            accountCreated.set(acc.id, new Date(acc.created_at || ''))
          }

          let txIdx = 0
          const result: NetWorthData[] = []

          for (const mb of monthBoundaries) {
            // Single-pass: apply all transactions up to this month's end
            while (txIdx < sortedTxs.length) {
              const tx = sortedTxs[txIdx] as
                | { account_id: string; type: string; amount: number; date: string }
                | undefined
              if (!tx || !tx.date || new Date(tx.date) > mb.end) break
              const prev = runningBalances.get(tx.account_id) ?? 0
              runningBalances.set(
                tx.account_id,
                tx.type === 'income' ? prev + Number(tx.amount) : prev - Number(tx.amount),
              )
              txIdx++
            }

            // Convert & sum up all account balances — skip accounts not yet created
            let totalAssets = 0
            let totalDebts = 0

            for (const acc of accounts) {
              if ((accountCreated.get(acc.id) ?? new Date()) > mb.end) continue

              const balance = runningBalances.get(acc.id) ?? 0
              const converted = convertAmount(balance, accountCurrency.get(acc.id) || defaultCurrency.value)

              if (isLiability.get(acc.id)) {
                totalDebts += converted
              } else {
                totalAssets += converted
              }
            }

            result.push({
              label: mb.label,
              assets: totalAssets,
              debts: totalDebts,
              netWorth: totalAssets - totalDebts,
              date: mb.dateStr,
            })
          }

          return result
        },
        staleTime: 60_000, // 1 min cache — net worth recalc is expensive
      })

      history.value = result
    } catch (error) {
      console.error('Failed to fetch net worth history:', error)
      const { toast } = useToast()
      toast.error('Failed to load net worth history')
    } finally {
      loading.value = false
    }
  }

  const currentNetWorth = computed(() => {
    if (history.value.length === 0) {
      return null
    }
    return history.value[history.value.length - 1]
  })

  return {
    history,
    loading,
    fetchNetWorthHistory,
    currentNetWorth,
  }
}
