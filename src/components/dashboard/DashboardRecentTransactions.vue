<template>
  <BaseCard
    class="md:col-span-6"
    :title="$t('dashboard.recent')"
    :subtitle="$t('dashboard.latest_activity')"
    no-padding
  >
    <template #action>
      <router-link
        to="/transactions"
        class="rounded-xl border border-border px-4 py-2 text-xs font-black text-foreground transition-all hover:bg-muted hover:border-border"
      >
        {{ $t('dashboard.view_all') }}
      </router-link>
    </template>

    <div class="p-4">
      <div
        v-if="recentTransactions.length === 0"
        class="flex flex-col items-center gap-4 py-12 text-center"
      >
        <div class="flex size-16 items-center justify-center rounded-full bg-muted/50">
          <AppIcon
            name="hugeicons:arrow-left-right"
            :size="32"
            class="text-muted-foreground/30"
          />
        </div>
        <div>
          <p class="text-base font-black text-foreground tracking-tight">
            {{ $t('dashboard.empty_title') }}
          </p>
          <p class="text-sm font-medium text-muted-foreground">
            {{ $t('dashboard.empty_desc') }}
          </p>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 gap-1">
        <router-link
          v-for="tx in recentTransactions"
          :key="tx.id"
          :to="`/transactions/${tx.id}/edit`"
          class="group flex items-center gap-4 rounded-3xl p-4 transition-all hover:bg-muted/50"
        >
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm"
            :class="
              tx.type === 'income'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            "
          >
            <AppIcon
              :name="tx.type === 'income' ? 'hugeicons:arrow-down-01' : 'hugeicons:arrow-up-01'"
              :size="20"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="truncate text-sm font-black text-foreground">
                {{
                  tx.description ||
                  getCategoryName(tx.category_id) ||
                  $t('sidebar.transactions')
                }}
              </p>
              <span
                v-if="getCategoryName(tx.category_id)"
                class="rounded-full bg-muted px-2 py-0.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest"
              >
                {{ getCategoryName(tx.category_id) }}
              </span>
            </div>
            <p class="text-xs font-bold text-muted-foreground/90">
              {{ formatRelativeDate(tx.date) }}
            </p>
          </div>
          <p
            class="shrink-0 text-lg font-black tracking-tighter"
            :class="
              tx.type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-foreground'
            "
          >
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount, tx.currency || undefined) }}
          </p>
        </router-link>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types'

defineOptions({
  name: 'DashboardRecentTransactions',
})

defineProps<{
  recentTransactions: Transaction[]
  getCategoryName: (id: string | null) => string
  formatRelativeDate: (date: string) => string
  formatCurrency: (amount: number, currency?: string) => string
}>()
</script>
