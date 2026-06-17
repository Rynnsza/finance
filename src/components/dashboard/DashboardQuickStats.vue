<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
    <!-- Rata-rata Pengeluaran Harian -->
    <StatCard
      :label="$t('dashboard.avg_daily_spend')"
      :value="avgDailySpend"
      :currency="activeCurrency"
      icon="hugeicons:calendar-01"
      :trend="undefined"
      :trend-value="undefined"
      variant="danger"
    />

    <!-- Tingkat Menabung -->
    <StatCard
      :label="$t('dashboard.savings_rate')"
      :value="savingsRateDisplay"
      currency=""
      icon="hugeicons:growth-chart-01"
      variant="success"
    />

    <!-- Anggaran Terpakai -->
    <StatCard
      :label="$t('dashboard.budget_used_short')"
      :value="budgetUsedDisplay"
      currency=""
      icon="hugeicons:pie-chart-01"
      :trend="budgetTrend"
      :trend-value="budgetTrendLabel"
      variant="info"
    />
  </div>
</template>

<script setup lang="ts">
import type { BudgetWithProgress } from '@/types'
import { useCurrency } from '@/composables/useCurrency'

const props = defineProps<{
  totalIncome: number
  totalExpense: number
  activeCurrency: string
  period: '1d' | '7d' | '30d' | 'all'
  budgetSummaries: BudgetWithProgress[]
}>()

const { formatCurrency, defaultCurrency } = useCurrency()

const daysInPeriod = computed(() => {
  const map = { '1d': 1, '7d': 7, '30d': 30, 'all': 0 }
  return map[props.period]
})

const avgDailySpend = computed(() => {
  if (daysInPeriod.value === 0 || props.totalExpense === 0) return 0
  return props.totalExpense / daysInPeriod.value
})

const savingsRate = computed(() => {
  if (props.totalIncome <= 0) return null
  return ((props.totalIncome - props.totalExpense) / props.totalIncome) * 100
})

const savingsRateDisplay = computed(() => {
  if (savingsRate.value === null) return '—'
  return `${savingsRate.value >= 0 ? '+' : ''}${savingsRate.value.toFixed(1)}%`
})

// Trend computation skipped — needs previous period data that isn't available here

// Budget usage aggregation
const totalBudgetAmount = computed(() => {
  return props.budgetSummaries.reduce((sum, b) => sum + b.amount, 0)
})

const totalSpentAmount = computed(() => {
  return props.budgetSummaries.reduce((sum, b) => sum + (b.spent || 0), 0)
})

const budgetUsedPercent = computed(() => {
  if (totalBudgetAmount.value <= 0) return null
  return (totalSpentAmount.value / totalBudgetAmount.value) * 100
})

const budgetUsedDisplay = computed(() => {
  if (budgetUsedPercent.value === null) {
    return props.budgetSummaries.length === 0 ? '—' : `${props.budgetSummaries.length} budget`
  }
  return `${budgetUsedPercent.value.toFixed(0)}%`
})

const budgetTrend = computed(() => {
  if (budgetUsedPercent.value === null) return undefined
  return budgetUsedPercent.value > 80 ? 'up' as const : undefined
})

const budgetTrendLabel = computed(() => {
  if (!budgetTrend.value) return ''
  return '80%+'
})
</script>
