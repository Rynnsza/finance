<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
  >
    <div v-if="events.length > 0" class="mt-6">
      <div class="rounded-3xl border border-border/50 bg-card shadow-sm">
        <div class="flex items-center justify-between border-b border-border/50 px-5 py-4 sm:px-6">
          <h3 class="text-base font-black tracking-tighter text-foreground">
            {{ formattedDate }}
          </h3>
          <span class="text-xs font-bold text-muted-foreground">
            {{ events.length }} {{ $t('schedule.no_events') }}
          </span>
        </div>
        <div class="divide-y divide-border/30">
          <div
            v-for="bill in bills"
            :key="'sb-' + bill.id"
            class="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20 sm:gap-4 sm:px-6 sm:py-4"
            @click="$emit('navigate-bill', bill.id)"
          >
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10"
              :class="bill.is_paid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'"
            >
              <AppIcon name="hugeicons:calendar-03" :size="18" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-foreground">{{ bill.title }}</p>
              <p class="text-[10px] font-bold text-muted-foreground/60">
                {{ $t('schedule.bills_due') }}
                <span
                  class="ml-1 rounded-full px-2 py-0.5 text-[9px] font-bold"
                  :class="bill.is_paid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'"
                >
                  {{ bill.is_paid ? $t('schedule.paid') : $t('schedule.unpaid') }}
                </span>
              </p>
            </div>
            <p class="shrink-0 text-sm font-black text-foreground">
              {{ formatCurrency(bill.amount) }}
            </p>
          </div>

          <div
            v-for="rec in recurring"
            :key="'sr-' + rec.id"
            class="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20 sm:gap-4 sm:px-6 sm:py-4"
            @click="$emit('navigate-recurring', rec.id)"
          >
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10"
              :class="rec.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500 dark:text-rose-400'"
            >
              <AppIcon
                :name="rec.type === 'income' ? 'hugeicons:arrow-down-01' : 'hugeicons:arrow-up-01'"
                :size="18"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-foreground">
                {{ rec.description || $t('recurring.no_description') }}
              </p>
              <p class="text-[10px] font-bold text-muted-foreground/60">
                {{ $t('schedule.recurring_on') }}
                <span class="ml-1 rounded-lg bg-muted px-2 py-0.5 text-[9px] font-bold">
                  {{ freqLabel(rec.frequency) }}
                </span>
              </p>
            </div>
            <p
              class="shrink-0 text-sm font-black"
              :class="rec.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'"
            >
              {{ rec.type === 'income' ? '+' : '-' }}{{ formatCurrency(Number(rec.amount), rec.currency || undefined) }}
            </p>
          </div>

          <div
            v-for="tx in transactions"
            :key="'st-' + tx.id"
            class="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20 sm:gap-4 sm:px-6 sm:py-4"
            @click="$emit('navigate-transaction', tx.id)"
          >
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10"
              :class="tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
            >
              <AppIcon
                :name="tx.type === 'income' ? 'hugeicons:arrow-down-01' : 'hugeicons:arrow-up-01'"
                :size="18"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-foreground">
                {{ tx.description || $t('transactions.no_description') }}
              </p>
              <p class="text-[10px] font-bold text-muted-foreground/60">
                {{ $t('sidebar.transactions') }}
              </p>
            </div>
            <p
              class="shrink-0 text-sm font-black"
              :class="tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'"
            >
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(Number(tx.amount), tx.currency || undefined) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Bill, RecurringTransaction, Transaction } from '@/types'

const props = defineProps<{
  formattedDate: string
  bills: Bill[]
  recurring: RecurringTransaction[]
  transactions: Transaction[]
  events: Array<Bill | RecurringTransaction | Transaction>
}>()

defineEmits<{
  'navigate-bill': [id: string]
  'navigate-recurring': [id: string]
  'navigate-transaction': [id: string]
}>()

const { formatCurrency } = useCurrency()
const { t } = useI18n()

function freqLabel(f: string) {
  const map: Record<string, string> = {
    daily: t('recurring.daily'),
    weekly: t('recurring.weekly'),
    monthly: t('recurring.monthly'),
    yearly: t('recurring.yearly'),
  }
  return map[f] ?? f
}
</script>
