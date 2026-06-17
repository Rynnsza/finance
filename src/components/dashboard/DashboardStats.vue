<template>
  <!-- Income Stats (1 col) -->
  <StatCard
    class="md:col-span-2 lg:col-span-1"
    :label="$t('dashboard.income')"
    :value="totalIncome"
    :currency="activeCurrency"
    icon="hugeicons:arrow-down-01"
    variant="success"
  />

  <!-- Expense Stats (1 col) -->
  <StatCard
    class="md:col-span-2 lg:col-span-1"
    :label="$t('dashboard.expense')"
    :value="totalExpense"
    :currency="activeCurrency"
    icon="hugeicons:arrow-up-01"
    variant="danger"
  />

  <!-- Net Worth Stats (1 col) -->
  <StatCard
    class="md:col-span-2 lg:col-span-1"
    :label="$t('dashboard.net_worth')"
    :value="netWorth"
    :currency="defaultCurrency"
    icon="hugeicons:chart-line-data-01"
    variant="info"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'DashboardStats',
})

defineProps<{
  totalIncome: number
  totalExpense: number
  activeCurrency: string
  netWorth: number
  defaultCurrency: string
}>()
</script>
