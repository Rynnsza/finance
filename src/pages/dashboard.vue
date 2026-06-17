<template>
  <div class="pb-10 pt-4">
    <DashboardHeader
      :display-name="displayName"
      :month-label="monthLabel"
      :is-partnered="isPartnered"
      :view-mode="viewMode"
      :view-modes="viewModes"
      :period="period"
      :period-options="periodOptions"
      @update:view-mode="viewMode = $event"
      @update:period="period = $event"
    />

    <DashboardSkeleton v-if="loading || summaryLoading" />

    <DashboardQuickStats
      v-if="!loading && !summaryLoading"
      :total-income="totalIncome"
      :total-expense="totalExpense"
      :active-currency="activeCurrency"
      :period="period"
      :budget-summaries="budgetSummaries"
      class="md:col-span-6"
    />

    <div v-if="!loading && !summaryLoading" class="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6">
      <DashboardBalanceCard
        :formatted-balance="formatCurrency(balance, activeCurrency)"
        :trend-display="trendDisplay"
        :is-positive="balance >= 0"
      />

      <DashboardStats
        :total-income="totalIncome"
        :total-expense="totalExpense"
        :active-currency="activeCurrency"
        :net-worth="currentNetWorth?.netWorth || 0"
        :default-currency="defaultCurrency"
      />

      <DashboardCharts
        :monthly-data="monthlyData"
      />

      <!-- Side Section: Budget/Accounts/Reminders (2 cols) -->
      <div class="flex flex-col gap-4 md:col-span-6 lg:col-span-2">
        <BillDashboardWidget />

        <DashboardBudgetSummary
          :budget-summaries="budgetSummaries"
          :current-month-str="currentMonthStr"
        />
      </div>

      <DashboardRecentTransactions
        :recent-transactions="recentTransactions"
        :get-category-name="getCategoryName"
        :format-relative-date="formatRelativeDate"
        :format-currency="formatCurrency"
      />

      <!-- Quick Accounts -->
      <BaseCard
        class="md:col-span-6"
        :title="$t('dashboard.accounts_title')"
      >
        <template #action>
          <router-link
            to="/accounts"
            class="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
          >
            {{ $t('dashboard.view_all') }}
          </router-link>
        </template>
        <div class="flex h-full flex-col justify-center pb-4">
          <template v-if="accountBalances.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="acct in accountBalances.slice(0, 3)"
                :key="acct.id"
                class="flex items-center justify-between rounded-xl bg-muted/30 p-2 transition-all hover:bg-muted/50"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="flex size-7 items-center justify-center rounded-lg bg-zinc-950 dark:bg-white shadow-sm border border-border/50"
                  >
                    <AccountIcon
                      v-if="acct.icon"
                      :icon="acct.icon"
                      :type="acct.type"
                      :size="14"
                    />
                  </div>
                  <span class="truncate text-xs font-bold text-foreground">{{ acct.name }}</span>
                </div>
                <span class="text-xs font-black tracking-tighter text-foreground">{{
                  formatCurrency(acct.balance, acct.currency || undefined)
                }}</span>
              </div>
            </div>
          </template>
          <div v-else class="flex flex-col items-center justify-center py-4 text-center">
            <div class="mb-2 flex size-10 items-center justify-center rounded-xl bg-muted/50">
              <AppIcon name="hugeicons:bank" :size="18" class="text-muted-foreground/40" />
            </div>
            <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
              {{ $t('accounts.empty') }}
            </p>
          </div>
        </div>
      </BaseCard>

      <DashboardQuickActions
        class="md:col-span-6"
        :action1="{ icon: 'hugeicons:add-01', color: '#4f46e5', title: $t('dashboard.actions_add_transaction'), desc: $t('dashboard.actions_add_transaction_desc'), to: '/transactions/new' }"
        :action2="{ icon: 'hugeicons:grid-view', color: '#f59e0b', title: $t('dashboard.actions_manage_categories'), desc: $t('dashboard.actions_manage_categories_desc'), to: '/categories' }"
        @navigate="(to) => router.push(to)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { getTransactionSummary as getTxSummaryService } from '@/services/transaction.service'
import type { BudgetWithProgress, AccountWithBalance, TransactionType } from "@/types"

defineOptions({
  name: 'DashboardPage',
})

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateSafe } from '@/lib/utils'
import BillDashboardWidget from '@/components/BillDashboardWidget.vue'
import DashboardBalanceCard from '@/components/dashboard/DashboardBalanceCard.vue'
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions.vue'

const ChartsMonthlyBar = defineAsyncComponent(() => import('@/components/charts/MonthlyBar.vue'))

const router = useRouter()
const { user, getSession } = useAuth()
const { transactions, fetchTransactions } = useTransactions()
const { categories, fetchCategories } = useCategories()
const { formatCurrency, defaultCurrency, convertTo } = useCurrency()
const { t, locale } = useI18n()
const { fetchPartner, partner, isPartnered, myProfile } = usePartner()

const viewMode = ref<'mine' | 'partner'>('mine')
const period = ref<'1d' | '7d' | '30d' | 'all'>('7d')

const activeCurrency = computed(() => {
  if (viewMode.value === 'partner' && isPartnered.value && partner.value?.currency) {
    return partner.value.currency
  }
  return defaultCurrency.value
})

const startDate = computed(() => {
  const now = new Date()
  if (period.value === 'all') return '1970-01-01'
  const daysMap = { '1d': 0, '7d': 6, '30d': 29 }
  const d = new Date(now.getTime() - (daysMap[period.value as keyof typeof daysMap] || 0) * 24 * 60 * 60 * 1000)
  return formatDateSafe(d)
})

const endDate = computed(() => formatDateSafe(new Date()))

const targetUserId = computed(() => {
  if (isPartnered.value && viewMode.value === 'partner') {
    return partner.value?.id
  }
  return user.value?.id
})

const { data: summary, isLoading: summaryLoading } = useTransactionSummary(
  targetUserId,
  startDate,
  endDate,
  activeCurrency,
)

const prevSummaryParams = computed(() => {
  if (period.value === 'all') return null
  const now = new Date()
  const daysMap = { '1d': 1, '7d': 7, '30d': 30 }
  const days = daysMap[period.value as keyof typeof daysMap] || 0
  
  const end = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  
  return {
    start: formatDateSafe(start),
    end: formatDateSafe(end)
  }
})

const { data: prevSummary } = useQuery({
  queryKey: ['transaction-summary-prev', targetUserId, prevSummaryParams, activeCurrency],
  queryFn: async () => {
    if (!targetUserId.value || !prevSummaryParams.value) return null
    const result = await getTxSummaryService(
      targetUserId.value,
      prevSummaryParams.value.start,
      prevSummaryParams.value.end,
      activeCurrency.value
    )
    if (result.error) throw result.error
    return result.data
  },
  enabled: computed(() => !!targetUserId.value && !!prevSummaryParams.value),
  staleTime: 60_000,
})

const totalIncome = computed(() => summary.value?.total_income || 0)
const totalExpense = computed(() => summary.value?.total_expense || 0)
const balance = computed(() => summary.value?.balance || 0)

const trendBalance = computed(() => {
  if (!prevSummary.value || prevSummary.value.balance === 0) {
    return balance.value !== 0 ? null : 0
  }
  return Math.round(((balance.value - prevSummary.value.balance) / prevSummary.value.balance) * 100)
})

const trendDisplay = computed(() => {
  if (trendBalance.value === null) return 'New'
  return `${Math.abs(trendBalance.value)}%`
})

const { fetchBudgetWithProgress, checkBudgetAlerts, budgetsWithProgress } = useBudgets()
const { fetchAccounts, accountBalances, fetchAccountBalances } = useAccounts()
const { currentNetWorth, fetchNetWorthHistory } = useNetWorth()
const { fetchRecurring, processDueRecurring } = useRecurring()
useReminders()

const loading = ref(true)
const budgetSummaries = ref<BudgetWithProgress[]>([])

const periodOptions = [
  { value: '1d' as const, label: '1D' },
  { value: '7d' as const, label: '7D' },
  { value: '30d' as const, label: '30D' },
  { value: 'all' as const, label: 'ALL' },
]

const viewModes = computed(() => [
  { value: 'mine' as const, label: displayName.value },
  {
    value: 'partner' as const,
    label: partner.value?.display_name?.split(' ')[0] || t('sidebar.partner'),
  },
])

const displayName = computed(() => {
  const name = myProfile.value?.display_name || user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || ''
  if (!name) {
    return t('dashboard.user')
  }
  return name.split(' ')[0]
})

const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
  return convertTo(amount, fromCurrency, toCurrency) ?? 0
}

const monthLabel = computed(() => {
  if (period.value === '1d') return t('dashboard.today')
  if (period.value === '7d') return t('dashboard.last_7_days')
  if (period.value === '30d') return t('dashboard.last_30_days')
  return t('dashboard.all_time')
})

const formatRelativeDate = (date: string) => {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return t('dashboard.today')
  if (diffDays === 1) return t('dashboard.yesterday')
  if (diffDays < 7) return t('dashboard.days_ago', { days: diffDays })
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
}

const categoryMap = computed(() => {
  const map = new Map<string, { name: string; color: string }>()
  for (const cat of categories.value) {
    map.set(cat.id, { name: cat.name, color: cat.color || '#6b7280' })
  }
  return map
})

const getCategoryName = (id: string | null) => {
  if (!id) return ''
  return categoryMap.value.get(id)?.name || ''
}

const currentMonthStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
})

const filteredTransactions = computed(() => {
  let list = transactions.value
  if (isPartnered.value) {
    const targetId = viewMode.value === 'mine' ? user.value?.id : partner.value?.id
    if (targetId) list = list.filter((tx) => tx.user_id === targetId)
  }
  return list
})

const recentTransactions = computed(() =>
  [...filteredTransactions.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5),
)

const monthlyData = computed(() => {
  // If viewing 1D or 7D, show daily granularity. If 30D or ALL, show monthly.
  if (period.value === '1d' || period.value === '7d') {
    const days = period.value === '1d' ? 1 : 7
    const data: { label: string; income: number; expense: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric' })
      const dateStr = formatDateSafe(d)

      const dayTx = filteredTransactions.value.filter((tx) => tx.date === dateStr)
      const activeCur = activeCurrency.value
      data.push(
        dayTx.reduce(
          (acc, t) => {
            const val = convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur)
            if (t.type === 'income') acc.income += val
            else if (t.type === 'expense') acc.expense += val
            return acc
          },
          { label, income: 0, expense: 0 },
        ),
      )
    }
    return data
  }

  // Monthly logic for 30D and ALL
  const months: { label: string; income: number; expense: number }[] = []
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const label = d.toLocaleDateString(locale.value, { month: 'short' })
    const m = d.getMonth()
    const y = d.getFullYear()

    const monthTx = transactions.value.filter((tx) => {
      const td = new Date(tx.date)
      return td.getMonth() === m && td.getFullYear() === y
    })

    const activeCur = activeCurrency.value
    months.push(
      monthTx.reduce(
        (acc, t) => {
          const val = convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur)
          if (t.type === 'income') acc.income += val
          else if (t.type === 'expense') acc.expense += val
          return acc
        },
        { label, income: 0, expense: 0 },
      ),
    )
  }
  return months
})

onMounted(async () => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const sixMonthsAgo = formatDateSafe(new Date(currentYear, currentMonth - 5, 1))

  // Ensure session is loaded before fetching (defense-in-depth for OAuth redirect)
  await getSession()

  await Promise.all([
    fetchTransactions({ dateFrom: sixMonthsAgo }),
    fetchCategories(),
    fetchPartner(),
    fetchNetWorthHistory(),
    fetchRecurring(),
    loadCurrency(),
  ])

  // Auto-process due recurring transactions
  await processDueRecurring()

  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
  await Promise.all([
    fetchBudgetWithProgress(monthStr),
    fetchAccounts(),
    fetchAccountBalances(),
  ])
  budgetSummaries.value = budgetsWithProgress.value

  // Check budget thresholds for alerts after fresh budget data is loaded
  await checkBudgetAlerts(monthStr)

  loading.value = false
})
</script>
