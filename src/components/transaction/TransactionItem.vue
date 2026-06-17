<template>
  <div
    class="group flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-3 transition-all hover:border-border hover:bg-card/50 md:p-5"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-2xl md:size-12"
        :style="{ backgroundColor: (categoryColor ?? '#6b7280') + '20' }"
      >
        <div class="size-3 rounded-full" :style="{ backgroundColor: categoryColor ?? '#6b7280' }" />
      </div>
      <!-- Owner badge -->
      <div
        v-if="isPartnered && isPartnerOwned"
        class="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-background bg-sidebar-accent -ml-2 self-end"
        :title="$t('transactions.owned_by', { name: partnerDisplayName })"
      >
        <span class="text-[8px] font-bold text-sidebar-foreground">{{ partnerInitial }}</span>
      </div>
      <div class="min-w-0">
        <h3 class="truncate font-medium text-foreground">
          {{ transaction.description || categoryName || $t('transactions.no_description') }}
        </h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ formattedDate }}</p>
        <p v-if="accountName" class="mt-1 text-xs text-muted-foreground/90">
          {{ accountName }}
        </p>
      </div>
    </div>
    <div class="ml-3 shrink-0 text-right md:ml-0">
      <p
        class="font-semibold md:text-lg"
        :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
      >
        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatted }}
      </p>
      <p class="mt-1 text-xs text-muted-foreground md:text-sm">
        {{ transaction.type === 'income' ? $t('transactions.income') : $t('transactions.expense') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types'

const props = defineProps<{
  transaction: Transaction
}>()

const { formatCurrency } = useCurrency()
const { locale } = useI18n()
const { categories } = useCategories()
const { accounts } = useAccounts()
const { partner, isPartnered, partnerDisplayName } = usePartner()

const isPartnerOwned = computed(() => partner.value?.id === props.transaction.user_id)
const partnerInitial = computed(() => partnerDisplayName.value?.charAt(0)?.toUpperCase() || 'P')

const category = computed(() =>
  categories.value.find((c) => c.id === props.transaction.category_id),
)
const categoryName = computed(() => category.value?.name ?? '')
const categoryColor = computed(() => category.value?.color)
const accountName = computed(() => {
  if (!props.transaction.account_id) {
    return ''
  }
  return accounts.value.find((a) => a.id === props.transaction.account_id)?.name ?? ''
})
const formatted = computed(() =>
  formatCurrency(Number(props.transaction.amount), props.transaction.currency || undefined),
)
const formattedDate = computed(() => {
  const d = new Date(props.transaction.date)
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
})
</script>
