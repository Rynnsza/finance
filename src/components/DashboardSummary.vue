<template>
  <div class="grid grid-cols-3 gap-3">
    <Card class="col-span-1">
      <CardContent class="p-3">
        <p class="text-[10px] font-medium text-muted-foreground">{{ $t('dashboard.income') }}</p>
        <p class="text-sm font-bold text-green-600 dark:text-green-400">{{ formatCurrency(summary.income) }}</p>
        <p v-if="convertedIncome !== null" class="text-[9px] text-muted-foreground">
          ≈ {{ formatCurrency(convertedIncome, 'USD') }}
        </p>
      </CardContent>
    </Card>
    <Card class="col-span-1">
      <CardContent class="p-3">
        <p class="text-[10px] font-medium text-muted-foreground">{{ $t('dashboard.expense') }}</p>
        <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ formatCurrency(summary.expense) }}</p>
        <p v-if="convertedExpense !== null" class="text-[9px] text-muted-foreground">
          ≈ {{ formatCurrency(convertedExpense, 'USD') }}
        </p>
      </CardContent>
    </Card>
    <Card class="col-span-1">
      <CardContent class="p-3">
        <p class="text-[10px] font-medium text-muted-foreground">{{ $t('dashboard.balance') }}</p>
        <p
          class="text-sm font-bold"
          :class="summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
        >
          {{ formatCurrency(summary.balance) }}
        </p>
        <p v-if="convertedBalance !== null" class="text-[9px] text-muted-foreground">
          ≈ {{ formatCurrency(convertedBalance, 'USD') }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  summary: { income: number; expense: number; balance: number }
}>()

const { formatCurrency, convertTo, defaultCurrency } = useCurrency()

const convertedIncome = computed(() =>
  convertTo(props.summary.income, defaultCurrency.value, 'USD'),
)
const convertedExpense = computed(() =>
  convertTo(props.summary.expense, defaultCurrency.value, 'USD'),
)
const convertedBalance = computed(() =>
  convertTo(props.summary.balance, defaultCurrency.value, 'USD'),
)
</script>
